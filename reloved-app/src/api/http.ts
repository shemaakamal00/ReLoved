// Funktionen som pratar med vårt API. Alla filer använder denna
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

/** Nyckeln i lS där AuthContext sparar inloggningen */
export const AUTH_STORAGE_KEY = "reloved-auth";

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  token?: string | null;
  body?: unknown;
  signal?: AbortSignal;
  cache?: RequestCache;
}

export async function request<T>(
  path: string,
  { method = "GET", token, body, signal, cache }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: payload,
    signal,
    cache,
  });

  if (response.status === 401 && token) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.location.href = "/login";
    throw new Error("Sessionen har gått ut, logga in igen.");
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Något gick fel");
  }

  return response.json();
}
