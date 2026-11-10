// Den inloggade användarens varukorg och favoriter som sparas i databasen */
import { request } from "./http";
import type { Product } from "../types";

export type ProductRow = { product_id: number; products: Product };
export type CartRow = ProductRow & { size: string; quantity: number };

// Varukorg

export function fetchCart(token: string) {
  return request<CartRow[]>("/cart", { token });
}

export function addCartItem(
  token: string,
  productId: number,
  { size = "", quantity = 1 }: { size?: string; quantity?: number } = {},
) {
  return request("/cart/items", {
    method: "POST",
    token,
    body: { product_id: productId, size, quantity },
  });
}

export function updateCartItem(
  token: string,
  productId: number,
  size: string,
  quantity: number,
) {
  return request(`/cart/items/${productId}`, {
    method: "PATCH",
    token,
    body: { size, quantity },
  });
}

export function removeCartItem(token: string, productId: number, size = "") {
  const query = size ? `?${new URLSearchParams({ size })}` : "";
  return request(`/cart/items/${productId}${query}`, {
    method: "DELETE",
    token,
  });
}

export function clearCart(token: string) {
  return request("/cart", { method: "DELETE", token });
}

// Favortier
export function fetchFavorites(token: string) {
  return request<ProductRow[]>("/favorites", { token });
}

export function addFavorite(token: string, productId: number) {
  return request(`/favorites/${productId}`, { method: "POST", token });
}

export function removeFavorite(token: string, productId: number) {
  return request(`/favorites/${productId}`, { method: "DELETE", token });
}
