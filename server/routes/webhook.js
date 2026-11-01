import express, { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { syncProductsToSearch } from "../lib/searchSync.js";
import {
  verifyWebhook,
  toPaymentEvent,
} from "../integrations/paymentAdapter.ts";

const router = Router();

async function handlePaid(payment) {
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, status, total, stripe_session_id")
    .eq("id", payment.orderId)
    .maybeSingle();
  if (error)
    throw new Error(
      `Kunde inte läsa order ${payment.orderId}: ${error.message}`,
    );

  if (!order) {
    console.warn(`[webhook] Order ${payment.orderId} finns inte`);
    return;
  }
  if (order.stripe_session_id !== payment.sessionId) {
    console.warn(
      `[webhook] Order ${order.id} hör inte till session ${payment.sessionId}`,
    );
    return;
  }

  if (
    payment.currency !== "sek" ||
    Math.round(payment.amountTotal) !== order.total
  ) {
    console.error(
      `[webhook] Beloppet stämmer inte för order ${order.id}: Stripe ${payment.amountTotal} ${payment.currency}, ordern ${order.total} sek`,
    );
    return;
  }

  const { data: result, error: rpcError } = await supabase.rpc(
    "mark_order_paid",
    {
      p_order_id: order.id,
      p_session_id: payment.sessionId,
    },
  );
  if (rpcError)
    throw new Error(
      `Kunde inte markera order ${order.id} som betald: ${rpcError.message}`,
    );

  if (result !== "paid") {
    console.log(
      `[webhook] Order ${order.id} var redan hanterad (status: ${order.status})`,
    );
    return;
  }
  console.log(`[webhook] Order ${order.id} är betald, lagret är uppdaterat`);

  const { data: items } = await supabase
    .from("order_items")
    .select("product_id")
    .eq("order_id", order.id);
  await syncProductsToSearch(
    (items ?? []).map((item) => item.product_id).filter(Boolean),
  );
}

async function handleExpired(payment) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", payment.orderId)
    .eq("stripe_session_id", payment.sessionId)
    .eq("status", "pending")
    .select("id");
  if (error)
    throw new Error(
      `Kunde inte avbryta order ${payment.orderId}: ${error.message}`,
    );

  if (data.length === 0) {
    console.log(
      `[webhook] Order ${payment.orderId} är inte obetald längre, ändras inte`,
    );
  } else {
    console.log(
      `[webhook] Order ${payment.orderId} avbruten: betalningen löpte ut`,
    );
  }
}

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    // 1. Kommer anropet verkligen från Stripe?
    const signature = req.headers["stripe-signature"];
    if (typeof signature !== "string") {
      return res.status(400).send("Saknar Stripe-Signature");
    }

    let event;
    try {
      event = verifyWebhook(req.body, signature);
    } catch (err) {
      console.warn(`[webhook] Ogiltig signatur: ${err.message}`);
      return res.status(400).send("Ogiltig signatur");
    }

    const payment = toPaymentEvent(event);
    try {
      if (payment.type === "paid") await handlePaid(payment);
      else if (payment.type === "expired") await handleExpired(payment);
      else console.log(`[webhook] Ignorerar ${event.type} (${payment.reason})`);
    } catch (err) {
      console.error(
        `[webhook] ${event.type} kunde inte hanteras: ${err.message}`,
      );
      return res.status(500).send("Kunde inte hantera händelsen");
    }

    res.json({ received: true });
  },
);

export default router;
