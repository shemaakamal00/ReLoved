import { request } from "./http";
import type { Category } from "../types";

export function fetchCategories(signal?: AbortSignal) {
  return request<Category[]>("/categories", { signal });
}

export function createCategory(
  name: string,
  parentId: number | null,
) {
  return request<Category>("/categories", {
    method: "POST",
    body: { name, parent_id: parentId },
  });
}

export function updateCategory(id: number, name: string) {
  return request<Category>(`/categories/${id}`, {
    method: "PATCH",
    body: { name },
  });
}

export function deleteCategory(id: number) {
  return request<{ success: boolean }>(`/categories/${id}`, {
    method: "DELETE",
  });
}
