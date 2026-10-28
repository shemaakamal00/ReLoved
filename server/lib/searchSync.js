import { supabase } from "./supabase.js";
import {
  indexProducts,
  removeProducts,
  replaceAllProducts,
} from "../integrations/searchAdapter.ts";

const SEARCHABLE_STATUS = "approved";
const PRODUCT_WITH_CATEGORY = "*, categories(name)";

export async function syncProductsToSearch(ids) {
  if (ids.length === 0) return true;
  try {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_WITH_CATEGORY)
      .in("id", ids);
    if (error) throw new Error(`Kunde inte läsa produkter: ${error.message}`);
    await indexProducts(data.filter((p) => p.status === SEARCHABLE_STATUS));
    await removeProducts(data.filter((p) => p.status !== SEARCHABLE_STATUS));
    return true;
  } catch (err) {
    console.error(`Sökindexet kunde inte uppdateras: ${err.message}`);
    return false;
  }
}

export async function removeFromSearch(products) {
  try {
    await removeProducts(products);
    return true;
  } catch (err) {
    console.error(`Kunde inte ta bort produkter ur sökindexet: ${err.message}`);
    return false;
  }
}

export async function reindexAllProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_WITH_CATEGORY)
    .eq("status", SEARCHABLE_STATUS);
  if (error) throw new Error(`Kunde inte läsa produkter: ${error.message}`);
  return replaceAllProducts(data);
}
