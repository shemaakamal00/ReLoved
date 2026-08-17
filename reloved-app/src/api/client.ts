import type {
  Product,
  Category,
  Order,
  OrderWithItems,
  AuthResponse,
  AdminStats,
  SellerOrderItem,
  SellerStats,
  User,
} from "../types";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, options);

  if (response.status === 401) {
    localStorage.removeItem("reloved-auth");
    window.location.href = "/login";
    throw new Error("Sessionen har gått ut, logga in igen.");
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Något gick fel");
  }

  return response.json();
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
  reason?: string,
): Promise<Product> {
  return apiFetch<Product>(`/products/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status, reason }),
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
  items: { product_id: number }[];
}

export function createOrder(orderData: CreateOrderPayload): Promise<Order> {
  return apiFetch<Order>("/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
}

export function fetchOrders(token: string): Promise<Order[]> {
  return apiFetch<Order[]>("/orders", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function fetchAllOrders(token: string): Promise<Order[]> {
  return apiFetch<Order[]>("/orders/all", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function fetchOrderById(
  id: number,
  token: string,
): Promise<OrderWithItems> {
  return apiFetch<OrderWithItems>(`/orders/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
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
  firstName: string,
  lastName: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName, lastName, email, password }),
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
  return apiFetch<{ product_id: number; products: Product }[]>("/cart", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function addCartItem(token: string, productId: number) {
  return apiFetch("/cart/items", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ product_id: productId }),
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

// profile
export function fetchMyProfile(token: string): Promise<User> {
  return apiFetch<User>("/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updateMyProfile(
  token: string,
  updates: {
    first_name: string;
    last_name: string;
    address: string;
    postal_code: string;
    city: string;
  },
): Promise<User> {
  return apiFetch<User>("/users/me", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
}

export function fetchAllProducts(token: string): Promise<Product[]> {
  return apiFetch<Product[]>("/products/all", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updateProduct(
  id: number,
  formData: FormData,
  token: string,
): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
}

export function deleteProduct(
  id: number,
  token: string,
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/products/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createCategory(
  name: string,
  parentId: number | null,
  token: string,
): Promise<Category> {
  return apiFetch<Category>("/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, parent_id: parentId }),
  });
}

export function updateCategory(
  id: number,
  name: string,
  token: string,
): Promise<Category> {
  return apiFetch<Category>(`/categories/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
}

export function deleteCategory(
  id: number,
  token: string,
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/categories/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updateMyListing(
  id: number,
  formData: FormData,
  token: string,
): Promise<Product> {
  return apiFetch<Product>(`/products/${id}/mine`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
}

export function deleteMyListing(
  id: number,
  token: string,
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/products/${id}/mine`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}
