// /api/stripe/webhook – Stripe meddelar att en betalning är klar eller har gått ut
import express, { Router } from "express";
import {
  verifyWebhook,
  toPaymentEvent,
} from "../integrations/paymentAdapter.ts";
import { handlePaid, handleExpired } from "../services/payments.js";

const router = Router();

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
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
