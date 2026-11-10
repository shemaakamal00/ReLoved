import { request } from "./http";
import type { Product, WithSearchStatus } from "../types";

type Deleted = WithSearchStatus<{ success: boolean }>;

// Alla godkända produkter
export function fetchProducts(signal?: AbortSignal) {
  return request<Product[]>("/products", { signal });
}

export function fetchProductById(id: string | number, signal?: AbortSignal) {
  return request<Product>(`/products/${id}`, { signal });
}

// Admin
export function fetchAllProducts(signal?: AbortSignal) {
  return request<Product[]>("/products/all", { signal });
}

// Annonser som väntar på granskning
export function fetchPendingProducts(signal?: AbortSignal) {
  return request<Product[]>("/products?status=pending", {
    signal,
    cache: "no-store",
  });
}

export function createProduct(form: FormData) {
  return request<WithSearchStatus<Product>>("/products", {
    method: "POST",
    body: form,
  });
}

export function updateProduct(id: number, form: FormData) {
  return request<WithSearchStatus<Product>>(`/products/${id}`, {
    method: "PATCH",
    body: form,
  });
}

export function updateProductStatus(
  id: number,
  status: Product["status"],
  reason?: string,
) {
  return request<WithSearchStatus<Product>>(`/products/${id}/status`, {
    method: "PATCH",
    body: { status, reason },
  });
}

export function deleteProduct(id: number) {
  return request<Deleted>(`/products/${id}`, { method: "DELETE" });
}

// Säljarens egna annonser
export function fetchMyListings(signal?: AbortSignal) {
  return request<Product[]>("/products/mine", { signal });
}

export function submitListing(form: FormData) {
  return request<Product>("/products/submit", {
    method: "POST",
    body: form,
  });
}

export function updateMyListing(id: number, form: FormData) {
  return request<WithSearchStatus<Product>>(`/products/${id}/mine`, {
    method: "PATCH",
    body: form,
  });
}

export function deleteMyListing(id: number) {
  return request<Deleted>(`/products/${id}/mine`, { method: "DELETE" });
}
