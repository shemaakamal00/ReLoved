//api/favorites är den inloggade användarens sparade produkter
import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { unwrap } from "../lib/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  res.json(
    await unwrap(
      supabase
        .from("favorites")
        .select("product_id, products(*)")
        .eq("user_id", req.user.userId),
      "Läsa favoriter",
    ),
  );
});

router.post("/:productId", async (req, res) => {
  await unwrap(
    supabase
      .from("favorites")
      .insert({ user_id: req.user.userId, product_id: req.params.productId }),
    "Spara favorit",
  );
  res.status(201).json({ success: true });
});

router.delete("/:productId", async (req, res) => {
  await unwrap(
    supabase
      .from("favorites")
      .delete()
      .eq("user_id", req.user.userId)
      .eq("product_id", req.params.productId),
    "Ta bort favorit",
  );
  res.json({ success: true });
});

export default router;
