import { Router } from "express";
import { z } from "zod";
import { supabase } from "../lib/supabase.js";
import { createCheckoutSession } from "../integrations/paymentAdapter.ts";
import {
  findServicePoints,
  estimateDelivery,
} from "../integrations/shippingAdapter.ts";
import { CartItems, CartError, priceCart } from "../lib/cartPricing.js";
import { PostalCode } from "../lib/postalCode.js";
import {
  SHIPPING_METHODS,
  SHIPPING_OPTIONS,
  shippingPrice,
} from "../lib/shippingPrices.js";

const router = Router();

const CheckoutRequest = z
  .object({
    email: z.email("Ange en giltig e-postadress"),
    phone: z.string().trim().min(5, "Ange ett telefonnummer").max(30),
    full_name: z.string().trim().min(2, "Ange ditt namn").max(200),
    address: z.string().trim().min(2, "Ange en adress").max(255),
    postal_code: PostalCode,
    city: z.string().trim().min(1, "Ange en stad").max(100),
    items: CartItems,
    shipping_method: z.enum(SHIPPING_METHODS, "Välj ett fraktalternativ"),
    service_point_id: z.string().trim().min(1).max(50).optional(),
  })
  .refine(
    (body) => body.shipping_method !== "service_point" || body.service_point_id,
    {
      message: "Välj ett ombud",
      path: ["service_point_id"],
    },
  );

router.post("/", async (req, res) => {
  const parsed = CheckoutRequest.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.issues[0]?.message ?? "Ogiltig beställning",
    });
  }
  const customer = parsed.data;

  let lines, subtotal;
  try {
    ({ lines, subtotal } = await priceCart(customer.items));
  } catch (err) {
    if (err instanceof CartError)
      return res.status(err.status).json({ error: err.message });
    throw err;
  }

  let servicePoint = null;
  if (customer.shipping_method === "service_point") {
    let nearby;
    try {
      nearby = await findServicePoints(customer.postal_code);
    } catch (err) {
      console.error(`Kassan: ${err.message}`);
      return res.status(502).json({
        error:
          "Vi kunde inte kontrollera ombudet hos PostNord. Försök igen, eller välj hemleverans.",
      });
    }
    servicePoint =
      nearby.find((point) => point.id === customer.service_point_id) ?? null;
    if (!servicePoint) {
      return res.status(400).json({
        error:
          "Ombudet finns inte bland ombuden för ditt postnummer. Välj ett ombud i listan.",
      });
    }
  }

  const shipping = shippingPrice(customer.shipping_method, subtotal);
  const total = subtotal + shipping;

  const estimatedDelivery = await estimateDelivery(customer.postal_code)
    .then((dates) => dates[customer.shipping_method])
    .catch((err) => {
      console.error(`Kassan: ${err.message}`);
      return null;
    });

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      email: customer.email,
      phone: customer.phone,
      full_name: customer.full_name,
      address: customer.address,
      postal_code: customer.postal_code,
      city: customer.city,
      subtotal,
      shipping,
      total,
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
    return res
      .status(500)
      .json({ error: "Kunde inte skapa ordern. Försök igen." });
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    lines.map(({ product, quantity, lineTotal }) => ({
      order_id: order.id,
      product_id: product.id,
      seller_id: product.seller_id,
      product_name: product.name,
      product_brand: product.brand,
      quantity,
      unit_price: product.price,
      line_total: lineTotal,
    })),
  );
  if (itemsError) {
    console.error(`Kassan: kunde inte spara orderrader: ${itemsError.message}`);
    await supabase.from("orders").delete().eq("id", order.id);
    return res
      .status(500)
      .json({ error: "Kunde inte skapa ordern. Försök igen." });
  }

  let checkout;
  try {
    checkout = await createCheckoutSession({
      id: order.id,
      email: customer.email,
      shipping,
      shippingName: servicePoint
        ? `${SHIPPING_OPTIONS.service_point.stripeName} (${servicePoint.name})`
        : SHIPPING_OPTIONS[customer.shipping_method].stripeName,
      lines: lines.map(({ product, quantity }) => ({
        name: `${product.brand} – ${product.name}`,
        unitPrice: product.price,
        quantity,
      })),
    });
  } catch (err) {
    console.error(
      `Kassan: Stripe svarade inte för order ${order.id}: ${err.message}`,
    );
    return res.status(502).json({
      error:
        "Betaltjänsten svarar inte just nu. Ingenting har dragits. Försök igen om en stund.",
    });
  }

  const { error: sessionError } = await supabase
    .from("orders")
    .update({ stripe_session_id: checkout.sessionId })
    .eq("id", order.id);
  if (sessionError) {
    console.error(
      `Kassan: kunde inte spara session-id: ${sessionError.message}`,
    );
    return res.status(500).json({ error: "Något gick fel. Försök igen." });
  }

  console.log(
    `Kassan: order ${order.id} skapad (${subtotal} kr + frakt ${shipping} kr = ${total} kr, ${customer.shipping_method}), skickar kunden till Stripe`,
  );
  res.status(201).json({ orderId: order.id, url: checkout.url });
});

router.get("/order", async (req, res) => {
  const sessionId = req.query.session_id;
  if (typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
    return res.status(400).json({ error: "Ogiltig betalningsreferens" });
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, status, subtotal, shipping, total, created_at, full_name, shipping_method, service_point_name, service_point_address, estimated_delivery, order_items(product_name, product_brand, quantity, unit_price, line_total)",
    )
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (error) {
    console.error(`Bekräftelse: ${error.message}`);
    return res.status(500).json({ error: "Kunde inte hämta ordern." });
  }
  if (!order) {
    return res.status(404).json({ error: "Ordern hittades inte." });
  }

  const { order_items, full_name, ...rest } = order;
  res.json({
    ...rest,
    first_name: full_name.split(" ")[0],
    items: order_items,
  });
});

export default router;
