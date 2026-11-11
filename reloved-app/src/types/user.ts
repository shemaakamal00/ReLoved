export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null; // eftersom admins loggar in med GitHub
  role: "customer" | "seller" | "admin";
  address?: string | null;
  postal_code?: string | null;
  city?: string | null;
}

export interface AuthResponse {
  user: User;
}

export interface CurrentUserResponse {
  user: User | null;
}

export interface ProfileUpdate {
  first_name: string;
  last_name: string;
  address: string;
  postal_code: string;
  city: string;
}
