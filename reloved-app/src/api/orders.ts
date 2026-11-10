import { request } from "./http";
import type {
  CartItemPayload,
  CheckoutPayload,
  Order,
  OrderConfirmation,
  OrderStatus,
  OrderWithItems,
  SellerOrderItem,
  ShippingQuote,
} from "../types";

// Kassan
export function fetchShippingQuote(
  payload: { postal_code?: string; items: CartItemPayload[] },
  signal?: AbortSignal,
) {
  return request<ShippingQuote>("/shipping/quote", {
    method: "POST",
    body: payload,
    signal,
  });
}

// Spara en obetald order
export function startCheckout(payload: CheckoutPayload) {
  return request<{ orderId: number; url: string }>("/checkout", {
    method: "POST",
    body: payload,
  });
}

export function fetchOrderConfirmation(
  sessionId: string,
  signal?: AbortSignal,
) {
  const query = new URLSearchParams({ session_id: sessionId });
  return request<OrderConfirmation>(`/checkout/order?${query}`, { signal });
}

// Kundens ordrar
export function fetchOrders(signal?: AbortSignal) {
  return request<Order[]>("/orders", { signal });
}

export function fetchOrderById(
  id: string | number,
  signal?: AbortSignal,
) {
  return request<OrderWithItems>(`/orders/${id}`, { signal });
}

// Säljare
export function fetchMySales( signal?: AbortSignal) {
  return request<SellerOrderItem[]>("/orders/seller", { signal });
}

// Admin
export function fetchAllOrders(signal?: AbortSignal) {
  return request<Order[]>("/orders/all", { signal });
}

export function updateOrderStatus(
  id: number,
  status: OrderStatus,
) {
  return request<Order>(`/orders/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}
