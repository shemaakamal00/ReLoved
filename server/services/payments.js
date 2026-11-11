// Vad som händer när Stripe meddelar att en betalning är klar eller har gått ut
import { supabase } from "../lib/supabase.js";
import { fetchCheckoutPayment } from "../integrations/paymentAdapter.ts";
import { productIdsInOrder } from "./orders.js";
import { syncProductsToSearch } from "./searchSync.js";

//Stämmer betalningen med ordern vi sparade i kassan?
function matchesOrder(order, payment) {
  if (order.stripe_session_id !== payment.sessionId) {
    console.warn(
      `[webhook] Order ${order.id} hör inte till session ${payment.sessionId}`,
    );
    return false;
  }
  if (
    payment.currency !== "sek" ||
    Math.round(payment.amountTotal) !== order.total
  ) {
    console.error(
      `[webhook] Beloppet stämmer inte för order ${order.id}: Stripe ${payment.amountTotal} ${payment.currency}, ordern ${order.total} sek`,
    );
    return false;
  }
  return true;
}

// De köpta plaggen tas bort ur kundens varukorg i databasen
async function removePurchasedFromCart(userId, productIds) {
  if (!userId || productIds.length === 0) return;
  const { data: carts } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId);
  const cartIds = (carts ?? []).map((cart) => cart.id);
  if (cartIds.length === 0) return;
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .in("cart_id", cartIds)
    .in("product_id", productIds);
  if (error)
    console.error(`[webhook] Kunde inte tömma varukorgen: ${error.message}`);
}

// När betalningen är klar så markeras ordern som betald och lagret minskas
export async function handlePaid(payment) {
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, status, total, stripe_session_id, user_id")
    .eq("id", payment.orderId)
    .maybeSingle();
  if (error) {
    throw new Error(
      `Kunde inte läsa order ${payment.orderId}: ${error.message}`,
    );
  }
  if (!order) {
    console.warn(`[webhook] Order ${payment.orderId} finns inte`);
    return;
  }
  if (!matchesOrder(order, payment)) return;

  const { data: result, error: rpcError } = await supabase.rpc(
    "mark_order_paid",
    { p_order_id: order.id, p_session_id: payment.sessionId },
  );
  if (rpcError) {
    throw new Error(
      `Kunde inte markera order ${order.id} som betald: ${rpcError.message}`,
    );
  }

  if (result !== "paid") {
    console.log(
      `[webhook] Order ${order.id} var redan hanterad (status: ${order.status})`,
    );
    return;
  }
  console.log(`[webhook] Order ${order.id} är betald, lagret är uppdaterat`);
  const productIds = await productIdsInOrder(order.id).catch(() => []);
  await removePurchasedFromCart(order.user_id, productIds);
  await syncProductsToSearch(productIds);
}

export async function confirmPaymentWithStripe(sessionId) {
  let payment;
  try {
    payment = await fetchCheckoutPayment(sessionId);
  } catch (err) {
    console.error(
      `[betalning] Kunde inte fråga Stripe om ${sessionId}: ${err.message}`,
    );
    return false;
  }
  if (payment.type !== "paid") return false;

  await handlePaid(payment);
  return true;
}

// Om ordern avröts så är ordern obetald
export async function handleExpired(payment) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", payment.orderId)
    .eq("stripe_session_id", payment.sessionId)
    .eq("status", "pending")
    .select("id");
  if (error) {
    throw new Error(
      `Kunde inte avbryta order ${payment.orderId}: ${error.message}`,
    );
  }

  console.log(
    data.length === 0
      ? `[webhook] Order ${payment.orderId} är inte obetald längre, ändras inte`
      : `[webhook] Order ${payment.orderId} avbruten: betalningen löpte ut`,
  );
}
