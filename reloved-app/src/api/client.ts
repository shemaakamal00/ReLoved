import type {
  Product,
  Category,
  Order,
  OrderWithItems,
  AuthResponse,
  AdminStats,
  SellerOrderItem,
  SellerStats,
} from "../types";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Något gick fel");
  }

  return data as T;
}

// Produkter
export function fetchProducts(status?: string): Promise<Product[]> {
  const query = status ? `?status=${status}` : "";
  return apiFetch<Product[]>(
    `/products${query}`,
    status ? { cache: "no-store" } : undefined,
  );
}

export function fetchProductById(id: string | number): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`);
}

// Kategorier
export function fetchCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/categories");
}

export function createProduct(
  formData: FormData,
  token: string,
): Promise<Product> {
  return apiFetch<Product>("/products", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
}

export function submitListing(
  formData: FormData,
  token: string,
): Promise<Product> {
  return apiFetch<Product>("/products/submit", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
}

export function fetchMyListings(token: string): Promise<Product[]> {
  return apiFetch<Product[]>("/products/mine", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function fetchMySales(token: string): Promise<SellerOrderItem[]> {
  return apiFetch<SellerOrderItem[]>("/orders/seller", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function fetchSellerStats(token: string): Promise<SellerStats> {
  return apiFetch<SellerStats>("/seller/stats", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updateProductStatus(
  id: number,
  status: string,
  token: string,
): Promise<Product> {
  return apiFetch<Product>(`/products/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
}

// Ordrar
interface CreateOrderPayload {
  email: string;
  phone: string;
  full_name: string;
  address: string;
  postal_code: string;
  city: string;
  items: { product_id: number; quantity: number }[];
}

export function createOrder(orderData: CreateOrderPayload): Promise<Order> {
  return apiFetch<Order>("/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
}

export function fetchOrders(email: string): Promise<Order[]> {
  return apiFetch<Order[]>(`/orders?email=${encodeURIComponent(email)}`);
}

export function fetchAllOrders(): Promise<Order[]> {
  return apiFetch<Order[]>("/orders");
}

export function fetchOrderById(id: number): Promise<OrderWithItems> {
  return apiFetch<OrderWithItems>(`/orders/${id}`);
}

export function updateOrderStatus(
  id: number,
  status: string,
  token: string,
): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
}

// Auth
export function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
}

export function loginUser(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export function fetchCart(token: string) {
  return apiFetch<
    { product_id: number; quantity: number; products: Product }[]
  >("/cart", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function addCartItem(
  token: string,
  productId: number,
  quantity: number,
) {
  return apiFetch("/cart/items", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ product_id: productId, quantity }),
  });
}

export function updateCartItem(
  token: string,
  productId: number,
  quantity: number,
) {
  return apiFetch(`/cart/items/${productId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ quantity }),
  });
}

export function removeCartItem(token: string, productId: number) {
  return apiFetch(`/cart/items/${productId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function fetchFavorites(token: string) {
  return apiFetch<{ product_id: number; products: Product }[]>("/favorites", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function addFavorite(token: string, productId: number) {
  return apiFetch(`/favorites/${productId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function removeFavorite(token: string, productId: number) {
  return apiFetch(`/favorites/${productId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function clearCart(token: string) {
  return apiFetch("/cart", {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function fetchAdminStats(token: string) {
  return apiFetch<AdminStats>("/admin/stats", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
