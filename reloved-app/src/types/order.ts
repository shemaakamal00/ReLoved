import type { CartItemPayload, ShippingMethod } from "./shipping";

export type OrderStatus =
  | "pending"
  | "paid"
  | "ordered"
  | "processing"
  | "shipped"
  | "delivered"
  | "refunded"
  | "cancelled";

export interface OrderShipping {
  shipping_method: ShippingMethod | null;
  service_point_name: string | null;
  service_point_address: string | null;
  estimated_delivery: string | null;
}

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
  size: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface SellerOrderItem extends OrderItem {
  orders: {
    id: number;
    status: OrderStatus;
    created_at: string;
  };
}

export interface CheckoutPayload {
  email: string;
  phone: string;
  full_name: string;
  address: string;
  postal_code: string;
  city: string;
  items: CartItemPayload[];
  shipping_method: ShippingMethod;
  service_point_id?: string;
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
    size: string | null;
    quantity: number;
    unit_price: number;
    line_total: number;
  }[];
}
