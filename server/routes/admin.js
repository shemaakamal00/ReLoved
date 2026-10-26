import { getSupplierCatalog } from "../integrations/supplierAdapter.ts";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { z } from "zod";

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

const ImportedProduct = z.object({
  sku: z.string().min(1, "Artikelnummer saknas"),
  ean: z.string().regex(/^\d{13}$/, "EAN måste vara exakt 13 siffror"),
  name: z
    .string()
    .min(1, "Benämning saknas")
    .max(150, "Benämningen är längre än 150 tecken"),
  category: z.string(),
  price: z
    .number({ error: "Priset är inte ett giltigt tal" })
    .positive("Priset måste vara större än 0"),
  stock: z
    .number({ error: "Lagersaldot är inte ett giltigt tal" })
    .int("Lagetsaldot måste vara ett heltal")
    .nonnegative("Lagersaldot kan inte vara negativit"),
  variants: z.array(z.array(z.string().min(1))),
});

const IMPORT_DEFAULTS = {
  brand: "FSU25 Grossit",
  seller_name: "ReLoved",
  condition: "Nyskick",
};

function describeIssues(error) {
  return error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
}

async function getCategoryIdsByName() {
  const { data, error } = await supabase.from("categories").select("id, name");
  if (error) throw new Error(`Kunde inte läsa kategorier: ${error.message}`);
  return new Map(data.map((c) => [c.name.toLowerCase(), c.id]));
}

function toProductRow(product, categoryIds) {
  return {
    sku: product.sku,
    ean: product.ean,
    name: product.name,
    price: Math.round(product.price),
    stock: product.stock,
    variants: product.variants,
    size:
      product.variants.length > 0 ? product.variants.join(", ") : "One size",
    category_id: categoryIds.get(product.category.toLowerCase()) ?? null,
    ...IMPORT_DEFAULTS,
    updated_at: new Date().toISOString(),
  };
}
router.post(
  "/products/import/:format",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { format } = req.params;
    if (format !== "csv" && format !== "xml") {
      return res
        .status(400)
        .json({ error: "Formatet måste vara csv eller xml" });
    }

    let candidates;
    try {
      candidates = await getSupplierCatalog(format);
    } catch (err) {
      console.error(`Import (${format}) misslyckades: ${err.message}`);
      return res.status(502).json({
        error:
          "Kunde inte hämta leverantörens katalog. Försök igen om en stund.",
      });
    }

    const valid = [];
    const skipped = [];
    const seenSkus = new Set();

    for (const candidate of candidates) {
      const result = ImportedProduct.safeParse(candidate);
      if (!result.success) {
        const reason = describeIssues(result.error);
        console.warn(
          `Hoppar över ${candidate.sku || "(saknar artNr)"}: ${reason}`,
        );
        skipped.push({
          sku: candidate.sku || null,
          name: candidate.name,
          reason,
        });
        continue;
      }
      if (seenSkus.has(result.data.sku)) {
        skipped.push({
          sku: result.data.sku,
          name: result.data.name,
          reason: "Artikelnumret förekommer flera gånger i filen",
        });
        continue;
      }
      seenSkus.add(result.data.sku);
      valid.push(result.data);
    }

    const { data: existing, error: existingError } = await supabase
      .from("products")
      .select("sku")
      .in("sku", [...seenSkus]);
    if (existingError) {
      console.err(`Import (${format}): ${existingError.message}`);
      return res.status(500).json({
        error: "Importen avbröts: Kunde inte läsa databasen. Inget sparades.",
      });
    }
    const existingSkus = new Set(existing.map((row) => row.sku));

    let categoryIds;
    try {
      categoryIds = await getCategoryIdsByName();
    } catch (err) {
      console.error(`Import (${format}): ${err.message}`);
      return res.status(500).json({
        error: "Importen avbröts: kunde inte läsa kategorier. Inget sparades.",
      });
    }

    const rows = valid.map((product) => toProductRow(product, categoryIds));
    const toUpdate = rows.filter((row) => existingSkus.has(row.sku));

    const toCreate = rows
      .filter((row) => !existingSkus.has(row.sku))
      .map((row) => ({ ...row, status: "approved" }));

    if (toUpdate.length > 0) {
      const { error } = await supabase
        .from("products")
        .upsert(toCreate, { onConflict: "sku" });
      if (error) {
        console.error(`Import (${format}), nya produkter: ${error.message}`);
        return res.status(500).json({
          error:
            toUpdate.length > 0
              ? `Importen avbröts delvis: ${toUpdate.length} befintliga produkter uppdaterades, men de nya kunde inte sparas.`
              : "Importen avbröts: nya produkter kunde inte sparas. Inget sparades.",
        });
      }
    }

    console.log(
      `Import (${format}): ${toCreate.length} nya, ${toUpdate.length} uppdaterade, ${skipped.length} överhoppade`,
    );

    res.json({
      format,
      total: candidates.length,
      created: toCreate.length,
      updated: toUpdate.length,
      skipped,
    });
  },
);
export default router;
