import { useEffect, useState } from "react";
import { fetchShippingQuote } from "../api";
import type { CartItemPayload, ShippingQuote } from "../types";
import { errorMessage } from "../utils/messages";

// Hämtar fraktalternativ för varukorgen
export function useShippingQuote(
  items: CartItemPayload[],
  postalCode?: string,
  { debounceMs = 0 } = {},
) {
  const cartKey = items.length > 0 ? JSON.stringify(items) : "";
  const key = `${cartKey}|${postalCode ?? ""}`;
  const [state, setState] = useState<{
    key: string | null;
    quote: ShippingQuote | null;
    error: string | null;
  }>({ key: null, quote: null, error: null });

  useEffect(() => {
    if (!cartKey) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      const payload = JSON.parse(cartKey) as CartItemPayload[];
      fetchShippingQuote(
        { postal_code: postalCode, items: payload },
        controller.signal,
      )
        .then((quote) => setState({ key, quote, error: null }))
        .catch((err) => {
          if (controller.signal.aborted) return;
          console.error("Kunde inte hämta frakt:", err);
          setState((prev) => ({
            key,
            quote: prev.quote,
            error: errorMessage(err, "Kunde inte hämta frakten."),
          }));
        });
    }, debounceMs);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [key, cartKey, postalCode, debounceMs]);

  return {
    quote: cartKey ? state.quote : null,
    loading: cartKey !== "" && state.key !== key,
    error: state.key === key ? state.error : null,
  };
}
