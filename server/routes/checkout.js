//api/checkout startar en betalning och visar orderbekräftelse
import { Router } from "express";
import { z } from "zod";
import { HttpError, parseOr400 } from "../lib/http.js";
import { CartItems } from "../services/cartPricing.js";
import { PostalCode, SHIPPING_METHODS } from "../services/shipping.js";
import { startCheckout, findOrderBySession } from "../services/checkout.js";

const router = Router();

const CheckoutRequest = z
  .object({
    email: z.email("Ange en giltig e-postadress"),
    phone: z.string().trim().min(5, "Ange ett telefonnummer").max(30),
    full_name: z.string().trim().min(2, "Ange ditt namn").max(200),
    address: z.string().trim().min(2, "Ange en adress").max(255),
    postal_code: PostalCode,
    city: z.string().trim().min(1, "Ange en stad").max(100),
    items: CartItems,
    shipping_method: z.enum(SHIPPING_METHODS, "Välj ett fraktalternativ"),
    service_point_id: z.string().trim().min(1).max(50).optional(),
  })
  .refine(
    (body) => body.shipping_method !== "service_point" || body.service_point_id,
    { message: "Välj ett ombud", path: ["service_point_id"] },
  );

router.post("/", async (req, res) => {
  const customer = parseOr400(CheckoutRequest, req.body, "Ogiltig beställning");
  res.status(201).json(await startCheckout(customer));
});

router.get("/order", async (req, res) => {
  const sessionId = req.query.session_id;
  if (typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
    throw new HttpError(400, "Ogiltig betalningsreferens");
  }
  res.json(await findOrderBySession(sessionId));
});

export default router;
