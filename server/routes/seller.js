// /api/seller/stats som är siffrorna överst i säljarpanelen.
import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { countRows } from "../lib/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/stats", requireAuth, async (req, res) => {
  const sellerId = req.user.userId;
  const count = (table, columns = "*") =>
    supabase
      .from(table)
      .select(columns, { count: "exact", head: true })
      .eq("seller_id", sellerId);

  const [pending, active, sold, pendingDelivery] = await Promise.all([
    countRows(count("products").eq("status", "pending")),
    countRows(count("products").eq("status", "approved")),
    countRows(count("order_items")),
    countRows(
      count("order_items", "*, orders!inner(status)").in("orders.status", [
        "ordered",
        "processing",
      ]),
    ),
  ]);

  res.json({ pending, active, sold, pendingDelivery });
});

export default router;
