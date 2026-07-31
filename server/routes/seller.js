import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/stats", requireAuth, async (req, res) => {
  try {
    const { count: pending } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", req.user.userId)
      .eq("status", "pending");

    const { count: active } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", req.user.userId)
      .eq("status", "approved");

    const { count: sold } = await supabase
      .from("order_items")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", req.user.userId);

    const { count: pendingDelivery } = await supabase
      .from("order_items")
      .select("*, orders!inner(status)", { count: "exact", head: true })
      .eq("seller_id", req.user.userId)
      .in("orders.status", ["ordered", "processing"]);

    res.json({
      pending: pending ?? 0,
      active: active ?? 0,
      sold: sold ?? 0,
      pendingDelivery: pendingDelivery ?? 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
