import Stripe from "stripe";

const SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "";
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";
const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";
const EXPIRES_MINUTES = Number(process.env.CHECKOUT_EXPIRES_MINUTES ?? 30);
const stripe = new Stripe(SECRET_KEY, {
  timeout: 10_000,
  maxNetworkRetries: 2,
});

export type CheckoutLine = {
  name: string;
  unitPrice: number;
  quantity: number;
};

export type CheckoutOrder = {
  id: number;
  email: string;
  lines: CheckoutLine[];
  shipping: number;
  shippingName: string;
};

function toOre(kronor: number): number {
  return Math.round(kronor * 100);
}

export async function createCheckoutSession(order: CheckoutOrder) {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
    order.lines.map((line) => ({
      quantity: line.quantity,
      price_data: {
        currency: "sek",
        unit_amount: toOre(line.unitPrice),
        product_data: { name: line.name },
      },
    }));

  if (order.shipping > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "sek",
        unit_amount: toOre(order.shipping),
        product_data: { name: order.shippingName },
      },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    customer_email: order.email,
    client_reference_id: String(order.id),
    success_url: `${CLIENT_URL}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${CLIENT_URL}/checkout?cancelled=1`,
    expires_at: Math.floor(Date.now() / 1000) + EXPIRES_MINUTES * 60,
  });

  if (!session.url) {
    throw new Error("Stripe skickade ingen betal-URL");
  }
  return { sessionId: session.id, url: session.url };
}

export function verifyWebhook(
  rawBody: Buffer,
  signature: string,
): Stripe.Event {
  if (!WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET saknas i .env");
  }
  return stripe.webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET);
}

export type PaymentEvent =
  | {
      type: "paid";
      orderId: number;
      sessionId: string;
      amountTotal: number;
      currency: string;
    }
  | { type: "expired"; orderId: number; sessionId: string }
  | { type: "ignored"; reason: string };

export function toPaymentEvent(event: Stripe.Event): PaymentEvent {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      if (session.payment_status !== "paid") {
        return {
          type: "ignored",
          reason: `payment_status ${session.payment_status}`,
        };
      }
      const orderId = Number(session.client_reference_id);
      if (!Number.isInteger(orderId)) {
        return { type: "ignored", reason: "saknar client_reference_id" };
      }
      return {
        type: "paid",
        orderId,
        sessionId: session.id,
        amountTotal: (session.amount_total ?? 0) / 100,
        currency: session.currency ?? "",
      };
    }

    case "checkout.session.expired": {
      const session = event.data.object;
      const orderId = Number(session.client_reference_id);
      if (!Number.isInteger(orderId)) {
        return { type: "ignored", reason: "Saknar client_reference_id" };
      }
      return { type: "expired", orderId, sessionId: session.id };
    }

    default:
      return { type: "ignored", reason: event.type };
  }
}
