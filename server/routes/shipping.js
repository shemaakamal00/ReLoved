import { Router } from "express";
import { z } from "zod";
import { CartItems, CartError, priceCart } from "../lib/cartPricing.js";
import { PostalCode } from "../lib/postalCode.js";
import {
  FREE_SHIPPING_FROM,
  SHIPPING_METHODS,
  SHIPPING_OPTIONS,
  shippingPrice,
} from "../lib/shippingPrices.js";
import {
  findServicePoints,
  estimateDelivery,
  PostNordInputError,
} from "../integrations/shippingAdapter.ts";

const router = Router();

const QuoteRequest = z.object({
  postal_code: PostalCode.optional(),
  items: CartItems,
});

router.post("/quote", async (req, res) => {
  const parsed = QuoteRequest.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: parsed.error.issues[0]?.message ?? "Ogiltig förfrågan" });
  }
  const { postal_code: postalCode, items } = parsed.data;

  let subtotal;
  try {
    ({ subtotal } = await priceCart(items));
  } catch (err) {
    if (err instanceof CartError)
      return res.status(err.status).json({ error: err.message });
    throw err;
  }

  let servicePoints = null;
  let deliveries = {};
  let servicePointsError = null;

  if (postalCode) {
    const [points, dates] = await Promise.allSettled([
      findServicePoints(postalCode),
      estimateDelivery(postalCode),
    ]);

    if (points.status === "fulfilled") {
      servicePoints = points.value;
      if (servicePoints.length === 0)
        servicePointsError =
          "PostNord hittade inga ombud nära ditt postnummer. Välj hemleverans.";
    } else {
      console.error(`[frakt] ${points.reason.message}`);
      servicePointsError =
        points.reason instanceof PostNordInputError
          ? `PostNord hittar inga ombud för postnummer ${postalCode}. Kontrollera att postnumret stämmer.`
          : "Vi kunde inte hämta ombud från PostNord just nu. Du kan välja hemleverans.";
    }

    if (dates.status === "fulfilled") deliveries = dates.value;
    else console.error(`[frakt] ${dates.reason.message}`);
  }

  res.json({
    subtotal,
    freeShippingFrom: FREE_SHIPPING_FROM,
    options: SHIPPING_METHODS.map((method) => ({
      method,
      label: SHIPPING_OPTIONS[method].label,
      price: shippingPrice(method, subtotal),
      estimatedDelivery: deliveries[method] ?? null,
    })),
    servicePoints,
    servicePointsError,
  });
});

export default router;
