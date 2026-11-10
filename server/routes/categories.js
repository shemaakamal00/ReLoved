//api/categories alla får läsa, bara admin får ändra
import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { unwrap } from "../lib/db.js";
import { HttpError } from "../lib/http.js";
import { adminOnly } from "../middleware/auth.js";

const router = Router();

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function requireName(name) {
  if (!name) throw new HttpError(400, "Ange ett namn");
}

router.get("/", async (req, res) => {
  res.json(
    await unwrap(supabase.from("categories").select("*"), "Läsa kategorier"),
  );
});

router.post("/", adminOnly, async (req, res) => {
  const { name, parent_id } = req.body;
  requireName(name);

  const category = await unwrap(
    supabase
      .from("categories")
      .insert({ name, slug: slugify(name), parent_id: parent_id || null })
      .select()
      .single(),
    "Skapa kategori",
  );
  res.status(201).json(category);
});

router.patch("/:id", adminOnly, async (req, res) => {
  const { name } = req.body;
  requireName(name);

  res.json(
    await unwrap(
      supabase
        .from("categories")
        .update({ name })
        .eq("id", req.params.id)
        .select()
        .single(),
      "Byta namn på kategori",
    ),
  );
});

router.delete("/:id", adminOnly, async (req, res) => {
  await unwrap(
    supabase.from("categories").delete().eq("id", req.params.id),
    "Ta bort kategori",
  );
  res.json({ success: true });
});

export default router;
