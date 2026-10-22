import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { fetchExchangeRates } from "../api/client";

export const CURRENCIES = [
  { code: "SEK", label: "SEK (kr)", decimals: 0 },
  { code: "EUR", label: "EUR (€)", decimals: 2 },
  { code: "USD", label: "USD ($)", decimals: 2 },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

const BASE_CURRENCY: CurrencyCode = "SEK";
const STORAGE_KEY = "reloved-currency";

type RatesStatus = "loading" | "ready" | "error";

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  status: RatesStatus;
  ratesDate: string | null;
  convert: (sekAmount: number) => number;
  formatPrice: (sekAmount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(
  undefined,
);

function isCurrencyCode(value: unknown): value is CurrencyCode {
  return CURRENCIES.some((c) => c.code === value);
}

function loadSavedCurrency(): CurrencyCode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isCurrencyCode(saved) ? saved : BASE_CURRENCY;
  } catch {
    return BASE_CURRENCY;
  }
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<CurrencyCode>(loadSavedCurrency);
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [ratesDate, setRatesDate] = useState<string | null>(null);
  const [status, setStatus] = useState<RatesStatus>("loading");

  useEffect(() => {
    const controller = new AbortController();

    fetchExchangeRates(controller.signal)
      .then((data) => {
        setRates(data.rates);
        setRatesDate(data.date);
        setStatus("ready");
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error("Kunde inte hämta valutakurser", error);
        setStatus("error");
      });

    return () => controller.abort();
  }, []);

  function setCurrency(code: CurrencyCode) {
    setSelected(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {}
  }

  const rate = rates?.[selected];
  const currency: CurrencyCode =
    typeof rate === "number" ? selected : BASE_CURRENCY;
  const activeRate = typeof rate === "number" ? rate : 1;

  function convert(sekAmount: number) {
    return sekAmount * activeRate;
  }

  function formatPrice(sekAmount: number) {
    const { decimals } = CURRENCIES.find((c) => c.code === currency)!;
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(convert(sekAmount));
  }

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, status, ratesDate, convert, formatPrice }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency måste användas inom CurrencyProvider");
  }
  return context;
}
