import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/stats", requireAuth, requireAdmin, async (req, res) => {
  try {
    const [pending, active, orders, users] = await Promise.all([
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved"),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("users").select("*", { count: "exact", head: true }),
    ]);

    res.json({
      pending: pending.count ?? 0,
      active: active.count ?? 0,
      orders: orders.count ?? 0,
      users: users.count ?? 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;