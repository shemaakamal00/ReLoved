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
  status: "pending" | "approved" | "rejected" | "sold" | "archived";
  created_at: string;
  rejection_reason: string | null;
  sku: string | null;
  ean: string | null;
  stock: number | null;
  variants: string[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: "customer" | "seller" | "admin";
  address?: string | null;
  postal_code?: string | null;
  city?: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "ordered"
  | "processing"
  | "shipped"
  | "delivered"
  | "refunded"
  | "cancelled";

export interface Order extends OrderShipping {
  id: number;
  user_id: number | null;
  email: string;
  phone: string;
  full_name: string;
  address: string;
  postal_code: string;
  city: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number | null;
  seller_id: number | null;
  product_name: string;
  product_brand: string;
  unit_price: number;
  line_total: number;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface AdminStats {
  pending: number;
  active: number;
  orders: number;
  users: number;
}

export interface SellerOrderItem extends OrderItem {
  orders: {
    id: number;
    status: OrderStatus;
    created_at: string;
  };
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
}

export interface ImportReport {
  format: ImportFormat;
  total: number;
  created: number;
  updated: number;
  skipped: { sku: string | null; name: string; reason: string }[];
  searchIndexed: boolean;
}

export type WithSearchStatus<T> = T & { searchIndexed?: boolean };
export type SearchProduct = Omit<
  Product,
  "seller_id" | "status" | "rejection_reason" | "ean"
> & { category: string | null };

export type SearchSort = "relevance" | "price_asc" | "price_desc" | "newest";

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

export interface CheckoutPayload {
  email: string;
  phone: string;
  full_name: string;
  address: string;
  postal_code: string;
  city: string;
  items: { product_id: number; quantity: number }[];
  shipping_method: ShippingMethod;
  service_point_id?: string;
}

export type ShippingMethod = "service_point" | "home";

export interface ServicePoint {
  id: string;
  name: string;
  address: string;
  distanceMeters: number | null;
}

export interface ShippingOption {
  method: ShippingMethod;
  label: string;
  price: number;
  estimatedDelivery: string | null;
}

export interface ShippingQuote {
  subtotal: number;
  freeShippingFrom: number;
  options: ShippingOption[];
  servicePoints: ServicePoint[] | null;
  servicePointsError: string | null;
}

export interface OrderShipping {
  shipping_method: ShippingMethod | null;
  service_point_name: string | null;
  service_point_address: string | null;
  estimated_delivery: string | null;
}

export interface OrderConfirmation extends OrderShipping {
  id: number;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  total: number;
  created_at: string;
  first_name: string;
  items: {
    product_name: string;
    product_brand: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }[];
}
