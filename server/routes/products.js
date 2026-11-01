import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { receiveImage, validateImage } from "../lib/upload.js";
import { uploadImage, discardImage, currentImagePath } from "../lib/productImages.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { syncProductsToSearch, removeFromSearch } from "../lib/searchSync.js";

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
  receiveImage,
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

    // 1. Är filen en riktig JPEG/PNG? Annars 400, innan något laddas upp.
    const { image, error: imageError } = validateImage(req.file);
    if (imageError) return res.status(400).json({ error: imageError });

    // 2. Ladda upp till Supabase Storage. Svarar inte tjänsten → 502, ingen produkt skapas.
    let stored = null;
    if (image) {
      const upload = await uploadImage(image);
      if (upload.error) return res.status(502).json({ error: upload.error });
      stored = upload.stored;
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
        image_path: stored?.path ?? null,
        image_url: stored?.url ?? null,
        alt_text: title,
        status: "approved",
      })
      .select()
      .single();

    // 3. Gick det inte att spara produkten? Då används bilden inte, så ta bort den igen.
    if (error) {
      await discardImage(stored?.path);
      return res.status(500).json({ error: error.message });
    }

    const searchIndexed = await syncProductsToSearch([data.id]);
    res.status(201).json({ ...data, searchIndexed });
  },
);

router.post(
  "/submit",
  requireAuth,
  receiveImage,
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

    const { image, error: imageError } = validateImage(req.file);
    if (imageError) return res.status(400).json({ error: imageError });

    let stored = null;
    if (image) {
      const upload = await uploadImage(image);
      if (upload.error) return res.status(502).json({ error: upload.error });
      stored = upload.stored;
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
        image_path: stored?.path ?? null,
        image_url: stored?.url ?? null,
        alt_text: title,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      await discardImage(stored?.path);
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(data);
  },
);

// --- Redigera produkter ---

router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  receiveImage,
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

    // Hämta produkten först: vi behöver veta var den gamla bilden ligger
    const { data: existing, error: fetchError } = await supabase
      .from("products")
      .select("id, image_path, image_url")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) return res.status(500).json({ error: fetchError.message });
    if (!existing) {
      return res.status(404).json({ error: "Produkten hittades inte" });
    }
    const oldImagePath = currentImagePath(existing);

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

    // Byte av bild: 1. validera  2. ladda upp den nya  3. spara  4. ta bort den gamla.
    // Misslyckas 1–3 ligger den gamla bilden kvar, orörd.
    const { image, error: imageError } = validateImage(req.file);
    if (imageError) return res.status(400).json({ error: imageError });

    let stored = null;
    if (image) {
      const upload = await uploadImage(image);
      if (upload.error) return res.status(502).json({ error: upload.error });
      stored = upload.stored;
      updates.image_path = stored.path;
      updates.image_url = stored.url;
      updates.alt_text = title;
    }

    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      await discardImage(stored?.path); // den nya bilden används inte
      return res.status(500).json({ error: error.message });
    }

    // Den nya bilden är sparad på produkten. Först NU tas den gamla bort.
    if (stored) await discardImage(oldImagePath);
    const searchIndexed = await syncProductsToSearch([data.id]);
    res.json({ ...data, searchIndexed });
  },
);

router.patch(
  "/:id/mine",
  requireAuth,
  receiveImage,
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
    const oldImagePath = currentImagePath(existing);

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

    // Byte av bild: 1. validera  2. ladda upp den nya  3. spara  4. ta bort den gamla.
    // Misslyckas 1–3 ligger den gamla bilden kvar, orörd.
    const { image, error: imageError } = validateImage(req.file);
    if (imageError) return res.status(400).json({ error: imageError });

    let stored = null;
    if (image) {
      const upload = await uploadImage(image);
      if (upload.error) return res.status(502).json({ error: upload.error });
      stored = upload.stored;
      updates.image_path = stored.path;
      updates.image_url = stored.url;
      updates.alt_text = title;
    }

    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      await discardImage(stored?.path); // den nya bilden används inte
      return res.status(500).json({ error: error.message });
    }

    // Den nya bilden är sparad på produkten. Först nu tas den gamla bort.
    if (stored) await discardImage(oldImagePath);
    const searchIndexed = await syncProductsToSearch([data.id]);
    res.json({ ...data, searchIndexed });
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

  const searchIndexed = await syncProductsToSearch([data.id]);
  res.json({ ...data, searchIndexed });
});

// --- Ta bort produkter säljare ---

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
  await discardImage(currentImagePath(existing)); // produkten är borta, då behövs inte bilden
  const searchIndexed = await removeFromSearch([existing]);
  res.json({ success: true, searchIndexed });
});

// --- Ta bort produkt (admin) ---

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;

  const { data: existing, error: fetchError } = await supabase
    .from("products")
    .select("id, sku, image_path, image_url")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return res.status(404).json({ error: "Produkten hittades inte" });
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  await discardImage(currentImagePath(existing)); // produkten är borta, då behövs inte bilden
  const searchIndexed = await removeFromSearch([existing]);
  res.json({ success: true, searchIndexed });
});

export default router;