// Kassan: från varukorg till obetald order och en betalsida hos Stripe
import { supabase } from "../lib/supabase.js";
import { HttpError } from "../lib/http.js";
import { createCheckoutSession } from "../integrations/paymentAdapter.ts";
import {
  findServicePoints,
  estimateDelivery,
} from "../integrations/shippingAdapter.ts";
import { priceCart } from "./cartPricing.js";
import { SHIPPING_OPTIONS, shippingPrice } from "./shipping.js";
import { confirmPaymentWithStripe } from "./payments.js";

const ORDER_FAILED = "Kunde inte skapa ordern. Försök igen.";

// Ombudet måste finnas bland PostNords ombud för kundes postnummer
async function resolveServicePoint(customer) {
  if (customer.shipping_method !== "service_point") return null;

  let nearby;
  try {
    nearby = await findServicePoints(customer.postal_code);
  } catch (err) {
    console.error(`Kassan: ${err.message}`);
    throw new HttpError(
      502,
      "Vi kunde inte kontrollera ombudet hos PostNord. Försök igen, eller välj hemleverans",
    );
  }

  const servicePoint = nearby.find(
    (point) => point.id === customer.service_point_id,
  );
  if (!servicePoint) {
    throw new HttpError(
      400,
      "Ombudet finns inte bland ombuden för ditt postnummer. Välj ett ombud i listan.",
    );
  }
  return servicePoint;
}

// Leveranstiden är bara information, köpet går igenom även om den saknas
async function estimatedDeliveryFor(customer) {
  try {
    const dates = await estimateDelivery(customer.postal_code);
    return dates[customer.shipping_method];
  } catch (err) {
    console.error(`Kassan: ${err.message}`);
    return null;
  }
}

// Om orderraderna misslyckas så tar ordern bort igen
async function saveOrder(
  customer,
  userId,
  { lines, subtotal, shipping, servicePoint, estimatedDelivery },
) {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      email: customer.email,
      phone: customer.phone,
      full_name: customer.full_name,
      address: customer.address,
      postal_code: customer.postal_code,
      city: customer.city,
      subtotal,
      shipping,
      total: subtotal + shipping,
      status: "pending",
      shipping_method: customer.shipping_method,
      service_point_id: servicePoint?.id ?? null,
      service_point_name: servicePoint?.name ?? null,
      service_point_address: servicePoint?.address ?? null,
      estimated_delivery: estimatedDelivery,
    })
    .select()
    .single();
  if (orderError) {
    console.error(`Kassan: kunde inte spara ordern: ${orderError.message}`);
    throw new HttpError(500, ORDER_FAILED);
  }
  const { error: itemsError } = await supabase.from("order_items").insert(
    lines.map(({ product, size, quantity, lineTotal }) => ({
      order_id: order.id,
      product_id: product.id,
      seller_id: product.seller_id,
      product_name: product.name,
      product_brand: product.brand,
      size: size || null,
      quantity,
      unit_price: product.price,
      line_total: lineTotal,
    })),
  );
  if (itemsError) {
    console.error(`Kassan: kunde inte spara orderrader: ${itemsError.message}`);
    await supabase.from("orders").delete().eq("id", order.id);
    throw new HttpError(500, ORDER_FAILED);
  }

  return order;
}

//Skapar en Strupe checkout session och sparar dess id på ordern
async function startPayment(
  order,
  customer,
  { lines, shipping, servicePoint },
) {
  let checkout;
  try {
    checkout = await createCheckoutSession({
      id: order.id,
      email: customer.email,
      shipping,
      shippingName: servicePoint
        ? `${SHIPPING_OPTIONS.service_point.stripeName} (${servicePoint.name})`
        : SHIPPING_OPTIONS[customer.shipping_method].stripeName,
      lines: lines.map(({ product, size, quantity }) => ({
        name: `${product.brand} – ${product.name}${size ? ` (stl ${size})` : ""}`,
        unitPrice: product.price,
        quantity,
      })),
    });
  } catch (err) {
    console.error(
      `Kassan: Stripe svarade inte för order ${order.id}: ${err.message}`,
    );
    throw new HttpError(
      502,
      "Betaltjänsten svarar inte just nu. Ingenting har dragits. Försök igen om en stund.",
    );
  }

  const { error } = await supabase
    .from("orders")
    .update({ stripe_session_id: checkout.sessionId })
    .eq("id", order.id);
  if (error) {
    console.error(`Kassan: kunde inte spara session-id: ${error.message}`);
    throw new HttpError(500, "Något gick fel. Försök igen.");
  }

  return checkout.url;
}

export async function startCheckout(customer, userId = null) {
  const { lines, subtotal } = await priceCart(customer.items);
  const servicePoint = await resolveServicePoint(customer);
  const shipping = shippingPrice(customer.shipping_method, subtotal);
  const estimatedDelivery = await estimatedDeliveryFor(customer);

  const details = {
    lines,
    subtotal,
    shipping,
    servicePoint,
    estimatedDelivery,
  };
  const order = await saveOrder(customer, userId, details);
  const url = await startPayment(order, customer, details);

  console.log(
    `Kassan: order ${order.id} skapad (${subtotal} kr + frakt ${shipping} kr = ${order.total} kr, ${customer.shipping_method}), skickar kunden till Stripe`,
  );
  return { orderId: order.id, url };
}

async function readOrderBySession(sessionId) {
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, status, subtotal, shipping, total, created_at, full_name, shipping_method, service_point_name, service_point_address, estimated_delivery, order_items(product_name, product_brand, size, quantity, unit_price, line_total)",
    )
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (error) {
    console.error(`Bekräftelse: ${error.message}`);
    throw new HttpError(500, "Kunde inte hämta ordern.");
  }
  if (!order) throw new HttpError(404, "Ordern hittades inte.");
  return order;
}

// Orderbekräftelse som visas när kunden kommer tillbaka från Stripe
export async function findOrderBySession(sessionId) {
  let order = await readOrderBySession(sessionId);

  // Webhooken har inte kommit än: fråga Stripe direkt
  if (
    order.status === "pending" &&
    (await confirmPaymentWithStripe(sessionId))
  ) {
    order = await readOrderBySession(sessionId);
  }

  const { order_items, full_name, ...rest } = order;
  return { ...rest, first_name: full_name.split(" ")[0], items: order_items };
}
