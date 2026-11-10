// Det som endast används i admin och säljarpanelen
import { request } from "./http";
import type {
  AdminStats,
  ImportFormat,
  ImportReport,
  SellerStats,
} from "../types";

export function fetchAdminStats(signal?: AbortSignal) {
  return request<AdminStats>("/admin/stats", { signal });
}

export function fetchSellerStats( signal?: AbortSignal) {
  return request<SellerStats>("/seller/stats", { signal });
}

// Hämtar leverantörens katalog och skapar/uppdaterar produkter.
export function importSupplierCatalog( format: ImportFormat) {
  return request<ImportReport>(`/admin/products/import/${format}`, {
    method: "POST",
  });
}

// Bygger om hela sökindexet från databasen.
export function reindexSearch() {
  return request<{ indexed: number }>("/admin/search/reindex", {
    method: "POST",
  });
}
