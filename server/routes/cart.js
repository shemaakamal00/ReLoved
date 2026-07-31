import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

async function getOrCreateCart(userId) {
  const { data: existingRows, error: selectError } = await supabase
    .from("carts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1);

  if (selectError) throw selectError;
  if (existingRows && existingRows.length > 0) return existingRows[0];

  const { data: created, error } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return created;
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.userId);
    const { data, error } = await supabase
      .from("cart_items")
      .select("product_id, products(*)")
      .eq("cart_id", cart.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/items", requireAuth, async (req, res) => {
  const { product_id, quantity = 1 } = req.body;

  try {
    const cart = await getOrCreateCart(req.user.userId);

    const { data: existing } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cart.id)
      .eq("product_id", product_id)
      .maybeSingle();

    if (existing) {
      return res.json(existing);
    }

    const { data, error } = await supabase
      .from("cart_items")
      .insert({ cart_id: cart.id, product_id, quantity })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/items/:productId", requireAuth, async (req, res) => {
  const { productId } = req.params;

  try {
    const cart = await getOrCreateCart(req.user.userId);
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cart.id)
      .eq("product_id", productId);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/", requireAuth, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.userId);
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cart.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;