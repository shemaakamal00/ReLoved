import type { CartItemPayload } from "../types";

// Varukorgen innehåller unika plagg, så antalet är alltid 1
export function toCartPayload(
  items: { product_id: number }[],
): CartItemPayload[] {
  return items.map((item) => ({ product_id: item.product_id, quantity: 1 }));
}
