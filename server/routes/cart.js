//api/cart den inloggade användarens varukorg som sparar i databasen
import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { unwrap } from "../lib/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// Varje användare har en varukorg.
async function getOrCreateCart(userId) {
  const [existing] = await unwrap(
    supabase
      .from("carts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1),
    "Läsa varukorg",
  );
  if (existing) return existing;

  return unwrap(
    supabase.from("carts").insert({ user_id: userId }).select().single(),
    "Skapa varukorg",
  );
}

router.get("/", async (req, res) => {
  const cart = await getOrCreateCart(req.user.userId);
  res.json(
    await unwrap(
      supabase
        .from("cart_items")
        .select("product_id, products(*)")
        .eq("cart_id", cart.id),
      "Läsa varukorgens produkter",
    ),
  );
});

router.post("/items", async (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  const cart = await getOrCreateCart(req.user.userId);

  // Second hand produkterna kan ligga i varukorgen en gång
  const existing = await unwrap(
    supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cart.id)
      .eq("product_id", product_id)
      .maybeSingle(),
    "Läsa varukorgsrad",
  );
  if (existing) return res.json(existing);

  const item = await unwrap(
    supabase
      .from("cart_items")
      .insert({ cart_id: cart.id, product_id, quantity })
      .select()
      .single(),
    "Lägga i varukorgen",
  );
  res.status(201).json(item);
});

router.delete("/items/:productId", async (req, res) => {
  const cart = await getOrCreateCart(req.user.userId);
  await unwrap(
    supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cart.id)
      .eq("product_id", req.params.productId),
    "Ta bort ur varukorgen",
  );
  res.json({ success: true });
});

router.delete("/", async (req, res) => {
  const cart = await getOrCreateCart(req.user.userId);
  await unwrap(
    supabase.from("cart_items").delete().eq("cart_id", cart.id),
    "Tömma varukorgen",
  );
  res.json({ success: true });
});

export default router;
