// /api/products här kan man läsa, skapa, ändra och ta bort produkter.
import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { unwrap } from "../lib/db.js";
import { HttpError } from "../lib/http.js";
import { receiveImage } from "../lib/upload.js";
import { requireAuth, requireAdmin, adminOnly } from "../middleware/auth.js";
import { syncProductsToSearch } from "../services/searchSync.js";
import {
  PRODUCT_STATUSES,
  productFieldsFrom,
  getProductOr404,
  assertSellerMayChange,
  createProduct,
  updateProduct,
  deleteProduct,
  setProductStatus,
  sellerDisplayName,
} from "../services/products.js";

const router = Router();

// Svarar med produkten plus om sökindexet hann uppdateras
async function respondWithSearchSync(res, product, status = 200) {
  const searchIndexed = await syncProductsToSearch([product.id]);
  res.status(status).json({ ...product, searchIndexed });
}

// Alla får se godkända produkter
function adminUnlessApproved(req, res, next) {
  const { status } = req.query;
  if (!status || status === "approved") return next();
  requireAuth(req, res, () => requireAdmin(req, res, next));
}

// Läsa
router.get("/all", adminOnly, async (req, res) => {
  res.json(
    await unwrap(
      supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false }),
      "Läsa alla produkter",
    ),
  );
});

router.get("/mine", requireAuth, async (req, res) => {
  res.json(
    await unwrap(
      supabase
        .from("products")
        .select("*")
        .eq("seller_id", req.user.userId)
        .order("created_at", { ascending: false }),
      "Läsa säljarens produkter",
    ),
  );
});

router.get("/:id", async (req, res) => {
  res.json(await getProductOr404(req.params.id));
});

router.get("/", adminUnlessApproved, async (req, res) => {
  const status = req.query.status || "approved";
  res.json(
    await unwrap(
      supabase.from("products").select("*").eq("status", status),
      "Läsa produkter",
    ),
  );
});

// Skapa

// Admin lägger upp en produkt som syns direkt
router.post("/", adminOnly, receiveImage, async (req, res) => {
  const { title, brand, price, condition } = req.body;
  if (!title || !brand || !price || !condition) {
    throw new HttpError(400, "Fyll i produktnamn, varumärke, pris och skick");
  }

  const product = await createProduct(
    { ...productFieldsFrom(req.body), status: "approved" },
    req.file,
  );
  await respondWithSearchSync(res, product, 201);
});

// Säljare skickar in en annons som admin granskar
router.post("/submit", requireAuth, receiveImage, async (req, res) => {
  const { title, brand, price } = req.body;
  if (!title || !brand || !price) {
    throw new HttpError(400, "Fyll i produktnamn, varumärke och pris");
  }

  const product = await createProduct(
    {
      ...productFieldsFrom(req.body),
      seller_id: req.user.userId,
      seller_name: await sellerDisplayName(req.user.userId),
      status: "pending",
    },
    req.file,
  );
  res.status(201).json(product);
});

// Redigera
router.patch("/:id", adminOnly, receiveImage, async (req, res) => {
  const existing = await getProductOr404(
    req.params.id,
    "id, image_path, image_url",
  );
  const product = await updateProduct(
    existing,
    productFieldsFrom(req.body),
    req.file,
  );
  await respondWithSearchSync(res, product);
});

router.patch("/:id/mine", requireAuth, receiveImage, async (req, res) => {
  const existing = await getProductOr404(req.params.id);
  assertSellerMayChange(existing, req.user.userId, "redigera");

  const product = await updateProduct(
    existing,
    productFieldsFrom(req.body),
    req.file,
  );
  await respondWithSearchSync(res, product);
});

router.patch("/:id/status", adminOnly, async (req, res) => {
  const { status, reason } = req.body;
  if (!PRODUCT_STATUSES.includes(status)) {
    throw new HttpError(400, "Ogiltig status");
  }

  const product = await setProductStatus(req.params.id, status, reason);
  await respondWithSearchSync(res, product);
});

// Ta bort
router.delete("/:id/mine", requireAuth, async (req, res) => {
  const existing = await getProductOr404(req.params.id);
  assertSellerMayChange(existing, req.user.userId, "ta bort");

  const searchIndexed = await deleteProduct(existing);
  res.json({ success: true, searchIndexed });
});

router.delete("/:id", adminOnly, async (req, res) => {
  const existing = await getProductOr404(
    req.params.id,
    "id, sku, image_path, image_url",
  );
  const searchIndexed = await deleteProduct(existing);
  res.json({ success: true, searchIndexed });
});

export default router;
