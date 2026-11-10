// Funktionen som pratar med vårt API. Alla filer använder denna
const API_URL = import.meta.env.VITE_API_URL || "/api";

// Används när servern svarar 401
export const UNAUTHORIZED_EVENT = "reloved:unauthorized";

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  cache?: RequestCache;
}

export async function request<T>(
  path: string,
  { method = "GET", body, signal, cache }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};

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
    credentials: "include",
  });

  if (response.status === 401) {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Något gick fel");
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}
