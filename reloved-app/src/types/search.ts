import type { Product } from "./product";

export type SearchProduct = Omit<
  Product,
  "seller_id" | "status" | "rejection_reason" | "ean"
> & { category: string | null };

export type SearchSort = "relevance" | "price_asc" | "price_desc" | "newest";

/** Filtren som strängar, precis som de står i adressfältet. */
export interface SearchFilters {
  sort: SearchSort;
  category: string;
  condition: string;
  minPrice: string;
  maxPrice: string;
}

export interface FacetValue {
  value: string;
  count: number;
}

export interface SearchResult {
  data: SearchProduct[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
  facets: { category: FacetValue[]; condition: FacetValue[] };
}
