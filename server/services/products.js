//// Affärslogiken för produkter: skapa, ändra och ta bort, inklusive bilden.
import { supabase } from "../lib/supabase.js";
import { unwrap } from "../lib/db.js";
import { HttpError } from "../lib/http.js";
import {
  storeUploadedImage,
  discardImage,
  currentImagePath,
} from "./productImages.js";
import { removeFromSearch } from "./searchSync.js";

export const PRODUCT_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "sold",
  "archived",
];

// Gör om forumlärets fält till kolumnerna i products
export function productFieldsFrom(body) {
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
  } = body;
  return {
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
}

function imageColumns(stored, altText) {
  return { image_path: stored.path, image_url: stored.url, alt_text: altText };
}

// Hämtar en produkt eller kastar 404
export async function getProductOr404(id, columns = "*") {
  const product = await unwrap(
    supabase.from("products").select(columns).eq("id", id).maybeSingle(),
    `Läsa produkt ${id}`,
  );
  if (!product) throw new HttpError(404, "Produkten hittades inte");
  return product;
}

// Säljare får endast ändra/ta bort sina egna annonser och inte om de är sålda
export function assertSellerMayChange(product, userId, action) {
  if (product.seller_id !== userId) {
    throw new HttpError(403, "Du äger inte den här annonsen");
  }
  if (product.status === "sold") {
    throw new HttpError(409, `Du kan inte ${action} en redan såld produkt`);
  }
}

// Skapar en produkt
export async function createProduct(fields, file) {
  const stored = await storeUploadedImage(file);

  const { data, error } = await supabase
    .from("products")
    .insert({
      ...fields,
      image_path: stored?.path ?? null,
      image_url: stored?.url ?? null,
      alt_text: fields.name,
    })
    .select()
    .single();

  if (error) {
    await discardImage(stored?.path);
    throw new Error(`Spara produkt: ${error.message}`);
  }
  return data;
}

// Uppdaterar en produkt och byter bild om en ny skickades
export async function updateProduct(existing, fields, file) {
  const stored = await storeUploadedImage(file);
  const updates = stored
    ? { ...fields, ...imageColumns(stored, fields.name) }
    : fields;

  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", existing.id)
    .select()
    .single();
  if (error) {
    await discardImage(stored?.path);
    throw new Error(`Uppdatera produkt ${existing.id}: ${error.message}`);
  }
  if (stored) await discardImage(currentImagePath(existing));
  return data;
}

// Tar bort produkten, dess bild och sökposten
export async function deleteProduct(existing) {
  await unwrap(
    supabase.from("products").delete().eq("id", existing.id),
    `Ta bort produkt ${existing.id}`,
  );
  await discardImage(currentImagePath(existing));
  return removeFromSearch([existing]);
}

// Sätter status och nekade annonser får en anledning
export async function setProductStatus(id, status, reason) {
  const rejection_reason =
    status === "rejected" ? reason || "Ingen anledning angavs." : null;

  return unwrap(
    supabase
      .from("products")
      .update({ status, rejection_reason })
      .eq("id", id)
      .select()
      .single(),
    `Ändra status på produkt ${id}`,
  );
}

export async function sellerDisplayName(userId) {
  const { data: seller } = await supabase
    .from("users")
    .select("first_name, last_name")
    .eq("id", userId)
    .maybeSingle();
  return seller ? `${seller.first_name} ${seller.last_name}` : "Okänd säljare";
}
