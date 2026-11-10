// Det som endast används i admin och säljarpanelen
import { request } from "./http";
import type {
  AdminStats,
  ImportFormat,
  ImportReport,
  SellerStats,
} from "../types";

export function fetchAdminStats(token: string, signal?: AbortSignal) {
  return request<AdminStats>("/admin/stats", { token, signal });
}

export function fetchSellerStats(token: string, signal?: AbortSignal) {
  return request<SellerStats>("/seller/stats", { token, signal });
}

// Hämtar leverantörens katalog och skapar/uppdaterar produkter.
export function importSupplierCatalog(token: string, format: ImportFormat) {
  return request<ImportReport>(`/admin/products/import/${format}`, {
    method: "POST",
    token,
  });
}

// Bygger om hela sökindexet från databasen.
export function reindexSearch(token: string) {
  return request<{ indexed: number }>("/admin/search/reindex", {
    method: "POST",
    token,
  });
}
