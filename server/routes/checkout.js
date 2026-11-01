import { Router } from "express";
import { z } from "zod";
import { supabase } from "../lib/supabase.js";
import { createCheckoutSession } from "../integrations/paymentAdapter.ts";

const router = Router();

const SHIPPING = 49;

const CheckoutRequest = z.object({
  email: z.email("Ange en giltig e-postadress"),
  phone: z.string().trim().min(5, "Ange ett telefonnummer").max(30),
  full_name: z.string().trim().min(2, "Ange ditt namn").max(200),
  address: z.string().trim().min(2, "Ange en adress").max(255),
  postal_code: z.string().trim().min(3, "Ange ett postnummer").max(20),
  city: z.string().trim().min(1, "Ange en stad").max(100),
  items: z
    .array(
      z.object({
        product_id: z.number().int().positive("Ogiltig produkt"),
        quantity: z
          .number()
          .int("Antalet måste vara ett heltal")
          .min(1, "Antalet måste vara minst 1")
          .max(10, "Högst 10 av samma produkt"),
      }),
    )
    .min(1, "Varukorgen är tom")
    .max(50, "För många produkter i varukorgen"),
});
router.post("/", async (req, res) => {
  const parsed = CheckoutRequest.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.issues[0]?.message ?? "Ogiltig beställning",
    });
  }
  const customer = parsed.data;

  const quantities = new Map();
  for (const item of customer.items) {
    quantities.set(
      item.product_id,
      (quantities.get(item.product_id) ?? 0) + item.quantity,
    );
  }
  const productIds = [...quantities.keys()];

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, brand, price, stock, status, seller_id")
    .in("id", productIds);
  if (productsError) {
    console.error(
      `Kassan: kunde inte läsa produkter: ${productsError.message}`,
    );
    return res.status(500).json({ error: "Något gick fel. Försök igen." });
  }

  for (const productId of productIds) {
    const product = products.find((p) => p.id === productId);
    const quantity = quantities.get(productId);

    if (!product) {
      return res
        .status(400)
        .json({ error: "En produkt i varukorgen finns inte längre." });
    }
    if (product.status !== "approved") {
      return res
        .status(409)
        .json({ error: `${product.name} är tyvärr redan såld.` });
    }
    if (product.stock === null && quantity > 1) {
      return res
        .status(409)
        .json({ error: `${product.name} finns bara i ett exemplar.` });
    }
    if (product.stock !== null && product.stock < quantity) {
      return res.status(409).json({
        error:
          product.stock === 0
            ? `${product.name} är slut i lager.`
            : `Det finns bara ${product.stock} st av ${product.name} kvar.`,
      });
    }
  }

  const lines = productIds.map((productId) => {
    const product = products.find((p) => p.id === productId);
    const quantity = quantities.get(productId);
    return { product, quantity, lineTotal: product.price * quantity };
  });
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const total = subtotal + SHIPPING;

  // 5. Spara ordern som OBETALD innan kunden skickas till Stripe
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
      shipping: SHIPPING,
      total,
      status: "pending",
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
      shipping: SHIPPING,
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
    `Kassan: order ${order.id} skapad (${total} kr), skickar kunden till Stripe`,
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
      "id, status, subtotal, shipping, total, created_at, full_name, order_items(product_name, product_brand, quantity, unit_price, line_total)",
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
