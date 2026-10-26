import { number, z } from "zod";
import { fetchJson } from "../lib/fetchJson.ts";
import { fa } from "zod/locales";

const BASE_URL =
  process.env.CURRENCY_API_URL ?? "https://api.frankfurter.dev/v1";
const TIMEOUT_MS = Number(process.env.CURRENCY_API_TIMEOUT_MS ?? 5000);
const CACHE_MS = Number(process.env.CURRENCY_CACHE_SECONDS ?? 3600) * 1000;

const FrankfurterRates = z.object({
  amount: z.number(),
  base: z.string().length(3),
  date: z.iso.date(),
  rates: z.record(z.string().length(3), z.number().positive()),
});

type FrankfurterRates = z.infer<typeof FrankfurterRates>;

export interface ExchangeRates {
  base: string;
  date: string;
  rates: Record<string, number>;
}

function toExchangeRates(data: FrankfurterRates): ExchangeRates {
  return {
    base: data.base,
    date: data.date,
    rates: { ...data.rates, [data.base]: 1 },
  };
}

async function fetchRates(
  base: string,
  symbols: string[],
): Promise<ExchangeRates> {
  const url = new URL(`${BASE_URL}/latest`);
  url.searchParams.set("base", base);
  if (symbols.length > 0) {
    url.searchParams.set("symbols", symbols.join(","));
  }

  const data = await fetchJson(url.toString(), { timeoutMs: TIMEOUT_MS });

  const parsed = FrankfurterRates.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      `Valutatjänsten svarade med ett oväntat format:\n${z.prettifyError(parsed.error)}`,
    );
  }

  const missing = symbols.filter((code) => !(code in parsed.data.rates));
  if (missing.length > 0) {
    throw new Error(`Valutatjänsten saknar kurs för: ${missing.join(", ")}`);
  }

  return toExchangeRates(parsed.data);
}

const cache = new Map<string, { value: ExchangeRates; expiresAt: number }>();

export async function getExchangeRates(
  base: string,
  targets: string[],
): Promise<ExchangeRates & { fromCache: boolean }> {
  const symbols = targets.filter((code) => code !== base).sort();
  const key = `${base}:${symbols.join(",")}`;

  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return { ...cached.value, fromCache: true };
  }

  const value = await fetchRates(base, symbols);
  cache.set(key, { value, expiresAt: Date.now() + CACHE_MS });
  return { ...value, fromCache: false };
}

export async function getExchangeRate(
  from: string,
  to: string,
): Promise<number> {
  if (from === to) return 1;

  const { rates } = await getExchangeRates(from, [to]);
  const rate = rates[to];
  if (rate === undefined) {
    throw new Error(`Ingen kurs hittades för ${from} → ${to}`);
  }
  return rate;
}
