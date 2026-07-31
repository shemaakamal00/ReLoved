import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// OBS: /seller måste ligga FÖRE /:id, annars fångar /:id den först

router.get("/seller", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("order_items")
    .select("*, orders(id, status, created_at)")
    .eq("seller_id", req.user.userId)
    .order("id", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (orderError) {
    return res.status(404).json({ error: "Ordern hittades inte" });
  }

  const isOwner = order.email === req.user.email;
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return res
      .status(403)
      .json({ error: "Du har inte tillgång till den här ordern" });
  }

  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  if (itemsError) {
    return res.status(500).json({ error: itemsError.message });
  }

  res.json({ ...order, items: orderItems });
});

router.get("/", async (req, res) => {
  const { email } = req.query;

  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (email) {
    query = query.eq("email", email);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

router.post("/", async (req, res) => {
  const { email, phone, full_name, address, postal_code, city, items } =
    req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Varukorgen är tom" });
  }

  const productsIds = items.map((item) => item.product_id);
  const { data: dbProducts, error: productsError } = await supabase
    .from("products")
    .select("*")
    .in("id", productsIds);

  if (productsError) {
    return res.status(500).json({ error: productsError.message });
  }

  const unavailable = dbProducts.filter((p) => p.status !== "approved");
  if (unavailable.length > 0) {
    return res.status(409).json({
      error: `Tyvärr, ${unavailable.map((p) => p.name).join(", ")} har redan sålts.`,
    });
  }

  let subtotal = 0;
  const orderItems = items.map((item) => {
    const product = dbProducts.find((p) => p.id === item.product_id);
    const lineTotal = product.price;
    subtotal += lineTotal;
    return {
      product_id: product.id,
      seller_id: product.seller_id,
      product_name: product.name,
      product_brand: product.brand,
      quantity: 1,
      unit_price: product.price,
      line_total: lineTotal,
    };
  });

  const shipping = 49;
  const total = subtotal + shipping;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      email,
      phone,
      full_name,
      address,
      postal_code,
      city,
      subtotal,
      shipping,
      total,
      status: "ordered",
    })
    .select()
    .single();

  if (orderError) {
    return res.status(500).json({ error: orderError.message });
  }

  const itemsWithOrderId = orderItems.map((item) => ({
    ...item,
    order_id: order.id,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemsWithOrderId);

  if (itemsError) {
    return res.status(500).json({ error: itemsError.message });
  }

  await supabase
    .from("products")
    .update({ status: "sold" })
    .in("id", productsIds);

  res.status(201).json(order);
});

router.patch("/:id/status", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = [
    "ordered",
    "processing",
    "shipped",
    "delivered",
    "refunded",
    "cancelled",
  ];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Ogiltig status" });
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (status === "refunded") {
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("product_id")
      .eq("order_id", id);

    const productIds = (orderItems ?? [])
      .map((item) => item.product_id)
      .filter(Boolean);

    if (productIds.length > 0) {
      await supabase
        .from("products")
        .update({ status: "approved" })
        .in("id", productIds);
    }
  }

  res.json(data);
});

export default router;