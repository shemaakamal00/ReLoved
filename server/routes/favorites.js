import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("favorites")
    .select("product_id, products(*)")
    .eq("user_id", req.user.userId);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post("/:productId", requireAuth, async (req, res) => {
  const { productId } = req.params;
  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: req.user.userId, product_id: productId });

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ success: true });
});

router.delete("/:productId", requireAuth, async (req, res) => {
  const { productId } = req.params;
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", req.user.userId)
    .eq("product_id", productId);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

export default router;