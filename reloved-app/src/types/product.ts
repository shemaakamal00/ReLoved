export type ProductStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "sold"
  | "archived";

export interface Product {
  id: number;
  seller_id: number | null;
  category_id: number | null;
  brand: string;
  name: string;
  size: string | null;
  condition: string;
  color: string | null;
  material: string | null;
  description: string | null;
  price: number;
  image_url: string | null;
  alt_text: string | null;
  seller_name: string | null;
  status: ProductStatus;
  created_at: string;
  rejection_reason: string | null;
  sku: string | null;
  ean: string | null;
  /** null = unikt plagg (ett exemplar), annars lagersaldo från leverantören. */
  stock: number | null;
  variants: string[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
}

/** Svar från API:et när en ändring också ska synas i sökningen. */
export type WithSearchStatus<T> = T & { searchIndexed?: boolean };
