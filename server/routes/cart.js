//api/cart den inloggade användarens varukorg som sparar i databasen
import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { unwrap } from "../lib/db.js";
import { z } from "zod";
import { HttpError, parseOr400 } from "../lib/http.js";
import { requireAuth } from "../middleware/auth.js";
import { MAX_QUANTITY, priceCart } from "../services/cartPricing.js";

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
        .select("product_id, size, quantity, products(*)")
        .eq("cart_id", cart.id),
      "Läsa varukorgens produkter",
    ),
  );
});

const AddItem = z.object({
  product_id: z.number().int().positive("Ogiltig produkt"),
  size: z.string().trim().max(50).default(""),
  quantity: z.number().int().min(1).max(MAX_QUANTITY).default(1),
});

const UpdateItem = z.object({
  size: z.string().trim().max(50).default(""),
  quantity: z
    .number()
    .int()
    .min(1, "Antalet måste vara minst 1")
    .max(MAX_QUANTITY, `Högst ${MAX_QUANTITY} av samma produkt`),
});

function findRow(cartId, productId, size) {
  return unwrap(
    supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cartId)
      .eq("product_id", productId)
      .eq("size", size)
      .maybeSingle(),
    "Läsa varukorgsrad",
  );
}

router.post("/items", async (req, res) => {
  const { product_id, size, quantity } = parseOr400(AddItem, req.body);
  const cart = await getOrCreateCart(req.user.userId);
  const existing = await findRow(cart.id, product_id, size);

  // Second hand-plagg ligger bara i varukorgen en gång
  if (existing) {
    const { stock } = await unwrap(
      supabase.from("products").select("stock").eq("id", product_id).single(),
      "Läsa produkt",
    );
    if (stock === null) return res.json(existing);
  }

  // Kollar att storleken finns och att lagret räcker för hela raden
  const total = Math.min((existing?.quantity ?? 0) + quantity, MAX_QUANTITY);
  await priceCart([{ product_id, size, quantity: total }]);

  if (existing) {
    return res.json(
      await unwrap(
        supabase
          .from("cart_items")
          .update({ quantity: total })
          .eq("cart_id", cart.id)
          .eq("product_id", product_id)
          .eq("size", size)
          .select()
          .single(),
        "Uppdatera antal",
      ),
    );
  }

  const item = await unwrap(
    supabase
      .from("cart_items")
      .insert({ cart_id: cart.id, product_id, size, quantity })
      .select()
      .single(),
    "Lägga i varukorgen",
  );
  res.status(201).json(item);
});

// Ändra antal på en rad (lagervaror)
router.patch("/items/:productId", async (req, res) => {
  const productId = Number(req.params.productId);
  const { size, quantity } = parseOr400(UpdateItem, req.body);
  const cart = await getOrCreateCart(req.user.userId);

  await priceCart([{ product_id: productId, size, quantity }]);
  const item = await unwrap(
    supabase
      .from("cart_items")
      .update({ quantity })
      .eq("cart_id", cart.id)
      .eq("product_id", productId)
      .eq("size", size)
      .select()
      .maybeSingle(),
    "Uppdatera antal",
  );
  if (!item) throw new HttpError(404, "Raden finns inte i varukorgen");
  res.json(item);
});

router.delete("/items/:productId", async (req, res) => {
  const size = typeof req.query.size === "string" ? req.query.size : "";
  const cart = await getOrCreateCart(req.user.userId);
  await unwrap(
    supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cart.id)
      .eq("product_id", req.params.productId)
      .eq("size", size),
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
