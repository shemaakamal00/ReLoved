// Impoterar leverantörens produktkatalog (CSV eller XML) till databasen
import { z } from "zod";
import { supabase } from "../lib/supabase.js";
import { HttpError } from "../lib/http.js";
import { getSupplierCatalog } from "../integrations/supplierAdapter.ts";
import { syncProductsToSearch } from "./searchSync.js";

export const IMPORT_FORMATS = ["csv", "xml"];

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
    .int("Lagersaldot måste vara ett heltal")
    .nonnegative("Lagersaldot kan inte vara negativt"),
  variants: z.array(z.string().min(1)),
});

const IMPORT_DEFAULTS = {
  brand: "FSU25 Grossist",
  seller_name: "ReLoved",
  condition: "Nyskick",
};

function describeIssues(error) {
  return error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
}

// Delar upp katalogien i giltiga produkter och överhoppade med orsak
function validateCandidates(candidates) {
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
  return { valid, skipped, skus: [...seenSkus] };
}

async function findExistingSkus(skus) {
  const { data, error } = await supabase
    .from("products")
    .select("sku")
    .in("sku", skus);
  if (error) {
    console.error(`Import: ${error.message}`);
    throw new HttpError(
      500,
      "Importen avbröts: Kunde inte läsa databasen. Inget sparades.",
    );
  }
  return new Set(data.map((row) => row.sku));
}

async function getCategoryIdsByName() {
  const { data, error } = await supabase.from("categories").select("id, name");
  if (error) {
    console.error(`Import: kunde inte läsa kategorier: ${error.message}`);
    throw new HttpError(
      500,
      "Importen avbröts: kunde inte läsa kategorier. Inget sparades.",
    );
  }
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

// Befintliga produkter behåller sin status, nya blir godkända direkt
async function saveRows(toUpdate, toCreate) {
  if (toUpdate.length > 0) {
    const { error } = await supabase
      .from("products")
      .upsert(toUpdate, { onConflict: "sku" });
    if (error) {
      console.error(`Import, uppdatering: ${error.message}`);
      throw new HttpError(
        500,
        "Importen avbröts när befintliga produkter skulle uppdateras. Inget sparades.",
      );
    }
  }

  if (toCreate.length > 0) {
    const { error } = await supabase
      .from("products")
      .upsert(toCreate, { onConflict: "sku" });
    if (error) {
      console.error(`Import, nya produkter: ${error.message}`);
      throw new HttpError(
        500,
        toUpdate.length > 0
          ? `Importen avbröts delvis: ${toUpdate.length} befintliga produkter uppdaterades, men de nya kunde inte sparas.`
          : "Importen avbröts: nya produkter kunde inte sparas. Inget sparades.",
      );
    }
  }
}

// Retunerar om sökindexet kunde uppdateras
async function syncImportedToSearch(skus) {
  const { data: saved } = await supabase
    .from("products")
    .select("id")
    .in("sku", skus);
  return syncProductsToSearch((saved ?? []).map((row) => row.id));
}

// Kör hela importen.
export async function importSupplierCatalog(format) {
  let candidates;
  try {
    candidates = await getSupplierCatalog(format);
  } catch (err) {
    console.error(`Import (${format}) misslyckades: ${err.message}`);
    throw new HttpError(
      502,
      "Kunde inte hämta leverantörens katalog. Försök igen om en stund.",
    );
  }

  const { valid, skipped, skus } = validateCandidates(candidates);
  const existingSkus = await findExistingSkus(skus);
  const categoryIds = await getCategoryIdsByName();

  const rows = valid.map((product) => toProductRow(product, categoryIds));
  const toUpdate = rows.filter((row) => existingSkus.has(row.sku));
  const toCreate = rows
    .filter((row) => !existingSkus.has(row.sku))
    .map((row) => ({ ...row, status: "approved" }));

  await saveRows(toUpdate, toCreate);
  console.log(
    `Import (${format}): ${toCreate.length} nya, ${toUpdate.length} uppdaterade, ${skipped.length} överhoppade`,
  );

  return {
    format,
    total: candidates.length,
    created: toCreate.length,
    updated: toUpdate.length,
    skipped,
    searchIndexed: await syncImportedToSearch(skus),
  };
}
