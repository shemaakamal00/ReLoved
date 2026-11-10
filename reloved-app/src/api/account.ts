// Inloggning, registrering och den egna profilen.
import { request } from "./http";
import type { AuthResponse, ProfileUpdate, User } from "../types";

export function loginUser(email: string, password: string) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function registerUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: { firstName, lastName, email, password },
  });
}

export function fetchMyProfile(token: string, signal?: AbortSignal) {
  return request<User>("/users/me", { token, signal });
}

export function updateMyProfile(token: string, updates: ProfileUpdate) {
  return request<User>("/users/me", { method: "PATCH", token, body: updates });
}
