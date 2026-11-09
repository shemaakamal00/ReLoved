//api/orders är kundens ordrar, säljarens försäljningar och admins orderhantering
import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { unwrap } from "../lib/db.js";
import { HttpError } from "../lib/http.js";
import { requireAuth, adminOnly } from "../middleware/auth.js";
import { ADMIN_ORDER_STATUSES, restockOrder } from "../services/orders.js";

const router = Router();

function newestOrdersQuery() {
  return supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
}

async function getOrderOr404(id, columns = "*") {
  const order = await unwrap(
    supabase.from("orders").select(columns).eq("id", id).maybeSingle(),
    `Läsa order ${id}`,
  );
  if (!order) throw new HttpError(404, "Ordern hittades inte");
  return order;
}

// Säljarens sålda produkter
router.get("/seller", requireAuth, async (req, res) => {
  res.json(
    await unwrap(
      supabase
        .from("order_items")
        .select("*, orders(id, status, created_at)")
        .eq("seller_id", req.user.userId)
        .order("id", { ascending: false }),
      "Läsa säljarens försäljningar",
    ),
  );
});

router.get("/all", adminOnly, async (req, res) => {
  res.json(await unwrap(newestOrdersQuery(), "Läsa alla ordrar"));
});

router.get("/:id", requireAuth, async (req, res) => {
  const order = await getOrderOr404(req.params.id);

  const isOwner = order.email === req.user.email;
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) {
    throw new HttpError(403, "Du har inte tillgång till den här ordern");
  }

  const items = await unwrap(
    supabase.from("order_items").select("*").eq("order_id", order.id),
    `Läsa orderrader för order ${order.id}`,
  );
  res.json({ ...order, items });
});

// Kunden ser sina egna ordrar, admin ser alla.
router.get("/", requireAuth, async (req, res) => {
  let query = newestOrdersQuery();
  if (req.user.role !== "admin") {
    query = query.eq("email", req.user.email);
  }
  res.json(await unwrap(query, "Läsa ordrar"));
});

router.patch("/:id/status", adminOnly, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!ADMIN_ORDER_STATUSES.includes(status)) {
    throw new HttpError(400, "Ogiltig status");
  }

  const current = await getOrderOr404(id, "status");
  if (current.status === "pending" && status !== "cancelled") {
    throw new HttpError(409, "Ordern är inte betald. Den kan bara avbrytas.");
  }

  const order = await unwrap(
    supabase.from("orders").update({ status }).eq("id", id).select().single(),
    `Ändra status på order ${id}`,
  );

  // Ordern är redan uppdaterad, så ett fel här loggas men stoppar inte svaret.
  if (status === "refunded") {
    await restockOrder(id).catch((err) =>
      console.error(`Order ${id}: ${err.message}`),
    );
  }
  res.json(order);
});

export default router;
