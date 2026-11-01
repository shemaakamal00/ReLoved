import { Router } from "express";
import { z } from "zod";
import { searchProducts } from "../integrations/searchAdapter.ts";

const router = Router();
const MAX_PAGE_SIZE = 48;

const OptionalPrice = (name) =>
  z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.coerce
      .number({ error: `${name} måste vara ett tal` })
      .int(`${name} måste vara ett heltal`)
      .min(0, `${name} kan inte vara negativt`)
      .max(1_000_000, `${name} är för högt`)
      .optional(),
  );

const OptionalText = (name) =>
  z.preprocess(
    (value) => (value === "" ? undefined : value),
    z
      .string()
      .trim()
      .min(1)
      .max(50, `${name} får vara högst 50 tecken`)
      .optional(),
  );

const SearchQuery = z
  .object({
    q: z
      .string()
      .trim()
      .max(100, "Söktexten får vara högst 100 tecken")
      .default(""),
    page: z.coerce
      .number({ error: "page måste vara ett tal" })
      .int("page måste vara ett heltal")
      .min(1, "page måste vara 1 eller större")
      .default(1),
    pageSize: z.coerce
      .number({ error: "pageSize måste vara ett tal" })
      .int("pageSize måste vara ett heltal")
      .min(1, "pageSize måste vara 1 eller större")
      .max(MAX_PAGE_SIZE, `pageSize får vara högst ${MAX_PAGE_SIZE}`)
      .default(12),
    sort: z
      .enum(["relevance", "price_asc", "price_desc", "newest"], {
        error: "sort måste vara relevance, price_asc, price_desc eller newest",
      })
      .default("relevance"),
    category: OptionalText("Kategori"),
    condition: OptionalText("Skick"),
    minPrice: OptionalPrice("Lägsta pris"),
    maxPrice: OptionalPrice("Högsta pris"),
  })
  .refine(
    (query) =>
      query.minPrice === undefined ||
      query.maxPrice === undefined ||
      query.minPrice <= query.maxPrice,
    { message: "Lägsta pris kan inte vara högre än högsta pris" },
  );

router.get("/", async (req, res) => {
  const result = SearchQuery.safeParse(req.query);
  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues[0]?.message ?? "Ogiltiga sökparametrar",
      details: result.error.issues.map((issue) => issue.message),
    });
  }
  try {
    res.json(await searchProducts(result.data));
  } catch (err) {
    console.error(`Sökningen misslyckades: ${err.message}`);
    res.status(502).json({
      error: "Sökningen är inte tillgänglig just nu. Försök igen om en stund.",
    });
  }
});

export default router;
