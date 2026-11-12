// Det som endast används i admin och säljarpanelen
import { request } from "./http";
import {
  type GitHubIssue,
  type AdminStats,
  type ImportFormat,
  type ImportReport,
  type SellerStats,
} from "../types";

export function fetchAdminStats(signal?: AbortSignal) {
  return request<AdminStats>("/admin/stats", { signal });
}

export function fetchSellerStats(signal?: AbortSignal) {
  return request<SellerStats>("/seller/stats", { signal });
}

// Hämtar leverantörens katalog och skapar/uppdaterar produkter.
export function importSupplierCatalog(format: ImportFormat) {
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

// Öppna issues i shoppens repo, hämtas med shoppens token
export function fetchOpenIssues(signal?: AbortSignal) {
  return request<GitHubIssue[]>("/admin/issues", { signal });
}

// Admin rapporterar en issue som servern skapar på GitHub
export function reportIssue(title: string, description: string) {
  return request<GitHubIssue>("/admin/issues", {
    method: "POST",
    body: { title, description },
  });
}
