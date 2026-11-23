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

// Ber servern skicka en återsällningslänk, samma svar oavsett om kontot finns eller inte
export function requestPasswordReset(email: string) {
  return request<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

// Byter lösenord med koden från länken i mejlet
export function resetPassword(token: string, password: string) {
  return request<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: { token, password },
  });
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
}

// Skickar kontaktformuläret till shoppens inkorg
export function sendContactMessage(form: ContactForm) {
  return request<{ message: string }>("/contact", {
    method: "POST",
    body: form,
  });
}
