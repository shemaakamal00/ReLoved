import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { upload } from "../lib/upload.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// --- Hämta produkter ---

router.get("/all", requireAuth, requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get("/mine", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", req.user.userId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return res.status(404).json({ error: "Produkten hittades inte" });
  }

  res.json(data);
});

router.get("/", async (req, res) => {
  const { status } = req.query;

  let query = supabase.from("products").select("*");
  query = status ? query.eq("status", status) : query.eq("status", "approved");

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// --- Skapa produkter ---

router.post(
  "/",
  requireAuth,
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    const {
      title,
      brand,
      price,
      category,
      condition,
      size,
      color,
      material,
      description,
    } = req.body;

    if (!title || !brand || !price || !condition) {
      return res
        .status(400)
        .json({ error: "Fyll i produktnamn, varumärke, pris och skick" });
    }

    let imageUrl = null;

    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

      if (uploadError) {
        return res.status(500).json({ error: uploadError.message });
      }

      const { data: publicUrlData } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);
      imageUrl = publicUrlData.publicUrl;
    }

    const { data, error } = await supabase
      .from("products")
      .insert({
        name: title,
        brand,
        price,
        category_id: category || null,
        condition,
        size,
        color,
        material,
        description,
        image_url: imageUrl,
        alt_text: title,
        status: "approved",
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
  },
);

router.post(
  "/submit",
  requireAuth,
  upload.single("image"),
  async (req, res) => {
    const {
      title,
      brand,
      price,
      category,
      condition,
      size,
      color,
      material,
      description,
    } = req.body;

    if (!title || !brand || !price) {
      return res
        .status(400)
        .json({ error: "Fyll i produktnamn, varumärke och pris" });
    }

    const { data: seller } = await supabase
      .from("users")
      .select("first_name, last_name")
      .eq("id", req.user.userId)
      .single();

    let imageUrl = null;

    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

      if (uploadError)
        return res.status(500).json({ error: uploadError.message });

      const { data: publicUrlData } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);
      imageUrl = publicUrlData.publicUrl;
    }

    const { data, error } = await supabase
      .from("products")
      .insert({
        name: title,
        brand,
        seller_id: req.user.userId,
        seller_name: seller
          ? `${seller.first_name} ${seller.last_name}`
          : "Okänd säljare",
        price,
        category_id: category || null,
        condition,
        size,
        color,
        material,
        description,
        image_url: imageUrl,
        alt_text: title,
        status: "pending",
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  },
);

// --- Redigera produkter ---

router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    const { id } = req.params;
    const {
      title,
      brand,
      price,
      category,
      condition,
      size,
      color,
      material,
      description,
    } = req.body;

    const updates = {
      name: title,
      brand,
      price,
      category_id: category || null,
      condition,
      size,
      color,
      material,
      description,
    };

    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

      if (uploadError)
        return res.status(500).json({ error: uploadError.message });

      const { data: publicUrlData } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);
      updates.image_url = publicUrlData.publicUrl;
      updates.alt_text = title;
    }

    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  },
);

router.patch(
  "/:id/mine",
  requireAuth,
  upload.single("image"),
  async (req, res) => {
    const { id } = req.params;
    const {
      title,
      brand,
      price,
      category,
      condition,
      size,
      color,
      material,
      description,
    } = req.body;

    const { data: existing, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: "Produkten hittades inte" });
    }

    if (existing.seller_id !== req.user.userId) {
      return res.status(403).json({ error: "Du äger inte den här annonsen" });
    }

    if (existing.status === "sold") {
      return res
        .status(409)
        .json({ error: "Du kan inte redigera en redan såld produkt" });
    }

    const updates = {
      name: title,
      brand,
      price,
      category_id: category || null,
      condition,
      size,
      color,
      material,
      description,
    };

    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

      if (uploadError)
        return res.status(500).json({ error: uploadError.message });

      const { data: publicUrlData } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);
      updates.image_url = publicUrlData.publicUrl;
      updates.alt_text = title;
    }

    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  },
);

router.patch("/:id/status", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  const validStatuses = ["pending", "approved", "rejected", "sold", "archived"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Ogiltig status" });
  }

  const updates = { status };
  if (status === "rejected") {
    updates.rejection_reason = reason || "Ingen anledning angavs.";
  } else {
    updates.rejection_reason = null;
  }

  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// --- Ta bort produkter ---

router.delete("/:id/mine", requireAuth, async (req, res) => {
  const { id } = req.params;

  const { data: existing, error: fetchError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return res.status(404).json({ error: "Produkten hittades inte" });
  }

  if (existing.seller_id !== req.user.userId) {
    return res.status(403).json({ error: "Du äger inte den här annonsen" });
  }

  if (existing.status === "sold") {
    return res
      .status(409)
      .json({ error: "Du kan inte ta bort en redan såld produkt" });
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

export default router;