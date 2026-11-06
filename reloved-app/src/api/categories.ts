import { request } from "./http";
import type { Category } from "../types";

export function fetchCategories(signal?: AbortSignal) {
  return request<Category[]>("/categories", { signal });
}

export function createCategory(
  token: string,
  name: string,
  parentId: number | null,
) {
  return request<Category>("/categories", {
    method: "POST",
    token,
    body: { name, parent_id: parentId },
  });
}

export function updateCategory(token: string, id: number, name: string) {
  return request<Category>(`/categories/${id}`, {
    method: "PATCH",
    token,
    body: { name },
  });
}

export function deleteCategory(token: string, id: number) {
  return request<{ success: boolean }>(`/categories/${id}`, {
    method: "DELETE",
    token,
  });
}
