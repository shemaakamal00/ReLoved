// Den inloggade användarens varukorg och favoriter som sparas i databasen */
import { request } from "./http";
import type { Product } from "../types";

export type ProductRow = { product_id: number; products: Product };
export type CartRow = ProductRow & { size: string; quantity: number };

// Varukorg

export function fetchCart() {
  return request<CartRow[]>("/cart", { });
}

export function addCartItem(
  productId: number,
  { size = "", quantity = 1 }: { size?: string; quantity?: number } = {},
) {
  return request("/cart/items", {
    method: "POST",
    body: { product_id: productId, size, quantity },
  });
}

export function updateCartItem(
  productId: number,
  size: string,
  quantity: number,
) {
  return request(`/cart/items/${productId}`, {
    method: "PATCH",
    body: { size, quantity },
  });
}

export function removeCartItem(productId: number, size = "") {
  const query = size ? `?${new URLSearchParams({ size })}` : "";
  return request(`/cart/items/${productId}${query}`, {
    method: "DELETE",
  });
}

export function clearCart() {
  return request("/cart", { method: "DELETE" });
}

// Favortier
export function fetchFavorites() {
  return request<ProductRow[]>("/favorites", { });
}

export function addFavorite( productId: number) {
  return request(`/favorites/${productId}`, { method: "POST" });
}

export function removeFavorite( productId: number) {
  return request(`/favorites/${productId}`, { method: "DELETE" });
}
