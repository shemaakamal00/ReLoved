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
}

export interface Category {
    id: number;
    name: string;
    slug: string;
}

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: "customer" | "seller" | "admin";
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface CartItem {
    id: string;
    quantity: number;
}

export type OrderStatus = "ordered" | "processing" | "shipped" | "delivered" | "refunded" | "cancelled";

export interface Order {
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
    quantity: number;
    unit_price: number;
    line_total: number;
}

export interface OrderWithItems extends Order {
    items: OrderItem [];
}