// Gemensamt för ordrar
import { supabase } from "../lib/supabase.js";
import { unwrap } from "../lib/db.js";
import { syncProductsToSearch } from "./searchSync.js";

// Statusar som admin får sätta.
export const ADMIN_ORDER_STATUSES = [
  "ordered",
  "processing",
  "shipped",
  "delivered",
  "refunded",
  "cancelled",
];

// Id:n på produkterna i en order
export async function productIdsInOrder(orderId) {
  const items = await unwrap(
    supabase.from("order_items").select("product_id").eq("order_id", orderId),
    `Läsa orderrader för order ${orderId}`,
  );
  return items.map((item) => item.product_id).filter(Boolean);
}

// Vid återbetalning blir produkterna till salu igen
export async function restockOrder(orderId) {
  const productIds = await productIdsInOrder(orderId);
  if (productIds.length === 0) return;

  await unwrap(
    supabase
      .from("products")
      .update({ status: "approved" })
      .in("id", productIds),
    `Lägga tillbaka produkterna i order ${orderId}`,
  );
  await syncProductsToSearch(productIds);
}
