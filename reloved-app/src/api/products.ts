import { request } from "./http";
import type { Product, WithSearchStatus } from "../types";

type Deleted = WithSearchStatus<{ success: boolean }>;

// Alla godkända produkter
export function fetchProducts(signal?: AbortSignal) {
  return request<Product[]>("/products", { signal });
}

export function fetchProductsById(id: string | number, signal?: AbortSignal) {
  return request<Product>(`/products/${id}`, { signal });
}

// Admin
export function fetchAllProducts(token: string, signal?: AbortSignal) {
  return request<Product[]>("/products/all", { token, signal });
}

// Annonser som väntar på granskning
export function fetchPendingProducts(token: string, signal?: AbortSignal) {
  return request<Product[]>("/products?status=pending", {
    token,
    signal,
    cache: "no-store",
  });
}

export function createProduct(token: string, form: FormData) {
  return request<WithSearchStatus<Product>>("/products", {
    method: "POST",
    token,
    body: form,
  });
}

export function updateProduct(token: string, id: number, form: FormData) {
  return request<WithSearchStatus<Product>>(`/products/${id}`, {
    method: "PATCH",
    token,
    body: form,
  });
}

export function updateProductStatus(
  token: string,
  id: number,
  status: Product["status"],
  reason?: string,
) {
  return request<WithSearchStatus<Product>>(`/products/${id}/status`, {
    method: "PATCH",
    token,
    body: { status, reason },
  });
}

export function deleteProduct(token: string, id: number) {
  return request<Deleted>(`/products/${id}`, { method: "DELETE", token });
}

// Säljarens egna annonser
export function fetchMyListings(token: string, signal?: AbortSignal) {
  return request<Product[]>("/products/mine", { token, signal });
}

export function submitListing(token: string, form: FormData) {
  return request<Product>("/products/submit", {
    method: "POST",
    token,
    body: form,
  });
}

export function updateMyListing(token: string, id: number, form: FormData) {
  return request<WithSearchStatus<Product>>(`/products/${id}/mine`, {
    method: "PATCH",
    token,
    body: form,
  });
}

export function deleteMyListing(token: string, id: number) {
  return request<Deleted>(`/products/${id}/mine`, { method: "DELETE", token });
}
