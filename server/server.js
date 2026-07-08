import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

app.get("/api/products", async (req, res) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "approved");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

app.get("/api/products/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return res.status(404).json({ error: "Produkten hittades inte" });
  }

  res.json(data);
});

app.get("/api/categories", async (req, res) => {
  const { data, error } = await supabase.from("categories").select("*");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

app.post("/api/orders", async (req, res) => {
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

  let subtotal = 0;
  const orderItems = items.map((item) => {
    const product = dbProducts.find((p) => p.id === item.product_id);
    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;
    return {
      product_id: product.id,
      seller_id: product.seller_id,
      product_name: product.name,
      product_brand: product.brand,
      quantity: item.quantity,
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
  res.status(201).json(order);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servern körs på http://localhost:${PORT}`);
});
