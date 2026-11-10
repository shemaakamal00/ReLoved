// /api/shipping/quote här är fraktalternativ, pris och ombud för en varukorg.
import { Router } from "express";
import { z } from "zod";
import { parseOr400 } from "../lib/http.js";
import { CartItems, priceCart } from "../services/cartPricing.js";
import {
  FREE_SHIPPING_FROM,
  SHIPPING_METHODS,
  SHIPPING_OPTIONS,
  PostalCode,
  shippingPrice,
} from "../services/shipping.js";
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

// Hämtar ombud och leveranstider från PostNord samtidigt.
async function fetchPostNordInfo(postalCode) {
  const [points, dates] = await Promise.allSettled([
    findServicePoints(postalCode),
    estimateDelivery(postalCode),
  ]);

  let servicePoints = null;
  let servicePointsError = null;
  if (points.status === "fulfilled") {
    servicePoints = points.value;
    if (servicePoints.length === 0) {
      servicePointsError =
        "PostNord hittade inga ombud nära ditt postnummer. Välj hemleverans.";
    }
  } else {
    console.error(`[frakt] ${points.reason.message}`);
    servicePointsError =
      points.reason instanceof PostNordInputError
        ? `PostNord hittar inga ombud för postnummer ${postalCode}. Kontrollera att postnumret stämmer.`
        : "Vi kunde inte hämta ombud från PostNord just nu. Du kan välja hemleverans.";
  }

  let deliveries = {};
  if (dates.status === "fulfilled") deliveries = dates.value;
  else console.error(`[frakt] ${dates.reason.message}`);

  return { servicePoints, servicePointsError, deliveries };
}

router.post("/quote", async (req, res) => {
  const { postal_code: postalCode, items } = parseOr400(QuoteRequest, req.body);
  const { subtotal } = await priceCart(items);

  const { servicePoints, servicePointsError, deliveries } = postalCode
    ? await fetchPostNordInfo(postalCode)
    : { servicePoints: null, servicePointsError: null, deliveries: {} };

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
