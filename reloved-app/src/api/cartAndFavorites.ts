// Den inloggade användarens varukorg och favoriter som sparas i databasen */
import { request } from "./http";
import type { Product } from "../types";

export type ProductRow = { product_id: number; products: Product };

// Varukorg

export function fetchCart(token: string) {
  return request<ProductRow[]>("/cart", { token });
}

export function addCartItem(token: string, productId: number) {
  return request("/cart/items", {
    method: "POST",
    token,
    body: { product_id: productId },
  });
}

export function removeCartItem(token: string, productId: number) {
  return request(`/cart/items/${productId}`, { method: "DELETE", token });
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
