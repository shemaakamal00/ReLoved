// Inloggning, registrering och den egna profilen.
import { request } from "./http";
import type {
  AuthResponse,
  CurrentUserResponse,
  ProfileUpdate,
  User,
} from "../types";

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

// Kollar vem som är inloggad, user är null om ingen är inloggad
export function fetchCurrentUser(signal?: AbortSignal) {
  return request<CurrentUserResponse>("/auth/me", { signal });
}

export function logoutUser() {
  return request<void>("/auth/logout", { method: "POST" });
}

// Google inloggningen är en vanlig länk
export function googleLoginUrl(returnTo = "/") {
  const base = import.meta.env.VITE_API_URL || "/api";
  return `${base}/auth/google?${new URLSearchParams({ returnTo })}`;
}

// En vanlig admin länk till servern som skickar dig vidare till GitHub
export function githubLoginUrl() {
  const base = import.meta.env.VITE_API_URL || "/api";
  return `${base}/auth/github`;
}

export function fetchMyProfile(signal?: AbortSignal) {
  return request<User>("/users/me", { signal });
}

export function updateMyProfile(updates: ProfileUpdate) {
  return request<User>("/users/me", { method: "PATCH", body: updates });
}
