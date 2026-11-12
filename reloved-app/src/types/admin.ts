export interface AdminStats {
  pending: number;
  active: number;
  orders: number;
  users: number;
}

export interface SellerStats {
  pending: number;
  active: number;
  sold: number;
  pendingDelivery: number;
}

export interface ExchangeRates {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export type ImportFormat = "csv" | "xml";

export interface ImportReport {
  format: ImportFormat;
  total: number;
  created: number;
  updated: number;
  skipped: { sku: string | null; name: string; reason: string }[];
  searchIndexed: boolean;
}

export interface GitHubIssue {
  number: number;
  title: string;
  url: string;
  createdAt: string;
}
