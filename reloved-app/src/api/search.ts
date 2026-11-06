import { request } from "./http";
import type { SearchFilters, SearchResult } from "../types";

export type SearchParams = {
  q: string;
  page: number;
  pageSize: number;
} & SearchFilters;

// Söker via vårt API, inga tomma fällt som skickas
export function searchProducts(params: SearchParams, signal?: AbortSignal) {
  const query = new URLSearchParams({
    q: params.q,
    page: String(params.page),
    pageSize: String(params.pageSize),
    sort: params.sort,
  });
  for (const name of [
    "category",
    "condition",
    "minPrice",
    "maxPrice",
  ] as const) {
    if (params[name]) query.set(name, params[name]);
  }
  return request<SearchResult>(`/search?${query}`, { signal });
}
