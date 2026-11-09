import type { CartItemPayload } from "../types";

export function toCartPayload(
  items: { product_id: number; size?: string; quantity?: number }[],
): CartItemPayload[] {
  return items.map((item) => ({
    product_id: item.product_id,
    size: item.size ?? "",
    quantity: item.quantity ?? 1,
  }));
}

// En rad i varukorgen är en produkt i en viss storlek
export function lineKey(item: { product_id: number; size?: string }) {
  return `${item.product_id}|${item.size ?? ""}`;
}

// Lagervaror (från leverantören) kan köpas i flera exemplar
export function isStockItem(product: { stock: number | null }) {
  return product.stock !== null;
}

export function hasSizes(product: { variants?: string[] | null }) {
  return (product.variants?.length ?? 0) > 0;
}
