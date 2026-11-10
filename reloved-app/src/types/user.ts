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

export interface ProfileUpdate {
  first_name: string;
  last_name: string;
  address: string;
  postal_code: string;
  city: string;
}
