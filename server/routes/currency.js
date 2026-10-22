import express from "express";
import { getExchangeRates } from "../integrations/currencyAdapter.ts";

const router = express.Router();

const BASE_CURRENCY = "SEK";
const SUPPORTED_CURRENCIES = ["SEK", "EUR", "USD", "IDR"];

router.get("/rates", async (req, res) => {
  const rates = await getExchangeRates(BASE_CURRENCY, SUPPORTED_CURRENCIES);
  res.json(rates);
});

export default router;
