const BASE_URL =
  process.env.FRANKFURTER_BASE_URL ?? "https://api.frankfurter.dev/v1";
const TIMEOUT_MS = Number(process.env.CURRENCY_API_TIMEOUT_MS ?? 5000);

export interface ExchangeRates {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export class CurrencyAdapterError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "CurrencyAdapterError";
    this.status = status;
  }
}

interface FrankfurterLatestResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

export async function getExchangeRates(
  base: string,
  targets: string[],
): Promise<ExchangeRates> {
  const symbols = targets.filter((code) => code !== base);

  const url = new URL(`${BASE_URL}/latest`);
  url.searchParams.set("base", base);
  if (symbols.length > 0) {
    url.searchParams.set("symbols", symbols.join(","));
  }

  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new CurrencyAdapterError(
        `Valutatjänsten svarade inte inom ${TIMEOUT_MS} ms`,
        504,
      );
    }
    throw new CurrencyAdapterError("Kunde inte nå valutatjänsten");
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new CurrencyAdapterError(`Okänd valuta: ${base}`, 400);
    }
    throw new CurrencyAdapterError(
      `Valutatjänsten svarade med status ${response.status}`,
    );
  }

  let data: FrankfurterLatestResponse;
  try {
    data = (await response.json()) as FrankfurterLatestResponse;
  } catch {
    throw new CurrencyAdapterError("Valutatjänsten skickade ogiltig JSON");
  }

  if (!data || typeof data.rates !== "object" || data.rates === null) {
    throw new CurrencyAdapterError("Oväntat svar från valutatjänsten");
  }

  return {
    base: data.base,
    date: data.base,
    rates: { ...data.rates, [data.base]: 1 },
  };
}

export async function getExchangeRate(
  from: string,
  to: string,
): Promise<number> {
  if (from === to) return 1;

  const { rates } = await getExchangeRates(from, [to]);
  const rate = rates[to];

  if (typeof rate !== "number") {
    throw new CurrencyAdapterError(
      `Ingen kurs hittades för ${from} → ${to}`,
      400,
    );
  }
  return rate;
}
