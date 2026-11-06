import { request } from "./http";
import type { ExchangeRates } from "../types";

export function fetchExchangeRates(signal?: AbortSignal) {
  return request<ExchangeRates>("/currency/rates", { signal });
}
