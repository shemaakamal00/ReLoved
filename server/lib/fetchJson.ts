const RETRYABLE = new Set([408, 429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

type FetchOptions = {
  headers?: Record<string, string>;
  timeoutMs?: number;
};

export async function fetchWithRetry(
  url: string,
  { headers = {}, timeoutMs = 5000 }: FetchOptions = {},
): Promise<Response> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let response: Response;
    try {
      response = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (err) {
      if (err instanceof Error && err.name === "TimeoutError") {
        throw new Error(
          `Inget svar från ${url} inom ${timeoutMs} ms (timeout)`,
        );
      }
      throw new Error(`Kunde inte nå ${url} (nätverksfel)`, { cause: err });
    }

    if (response.ok) {
      return response.json();
    }

    if (!RETRYABLE.has(response.status) || attempt === MAX_ATTEMPTS) {
      throw new Error(
        `${url} svarade med status ${response.status} ${response.statusText}`,
      );
    }

    console.warn(
      `Status ${response.status}, försök ${attempt} av ${MAX_ATTEMPTS}. Försöker igen om 1 sekund.`,
    );
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  }
  throw new Error("Oväntat slut på fetchWithRetry");
}

export async function fetchJson(
  url: string,
  options: FetchOptions = {},
) : Promise<unknown> {
  const response = await fetchWithRetry(url, options);
  return response.json();
}
