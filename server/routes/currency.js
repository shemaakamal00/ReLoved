import express from "express";
import { getExchangeRates } from "../integrations/currencyAdapter.ts";

const router = express.Router();

const BASE_CURRENCY = "SEK";
const SUPPORTED_CURRENCIES = ["SEK", "EUR", "USD", "GBP"];

router.get("/rates", async (req, res) => {
  const { fromCache, ...rates } = await getExchangeRates(
    BASE_CURRENCY,
    SUPPORTED_CURRENCIES,
  );
  res.set("X-Cache", fromCache ? "HIT" : "MISS");
  res.json(rates);
});

export default router;
