// Räknar fram varukorgens pris från databasen
import { z } from "zod";
import { supabase } from "../lib/supabase.js";
import { HttpError } from "../lib/http.js";

export const MAX_QUANTITY = 10;

export const CartItems = z
  .array(
    z.object({
      product_id: z.number().int().positive("Ogiltig produkt"),
      size: z.string().trim().max(50).default(""),
      quantity: z
        .number()
        .int("Antalet måste vara ett heltal")
        .min(1, "Antalet måste vara minst 1")
        .max(MAX_QUANTITY, `Högst ${MAX_QUANTITY} av samma produkt`),
    }),
  )
  .min(1, "Varukorgen är tom")
  .max(50, "För många produkter i varukorgen");

const lineKey = (item) => `${item.product_id}|${item.size}`;

// Slår ihop rader med samma produkt och storlek
function mergeLines(items) {
  const lines = new Map();
  for (const item of items) {
    const key = lineKey(item);
    const current = lines.get(key);
    lines.set(key, {
      product_id: item.product_id,
      size: item.size,
      quantity: (current?.quantity ?? 0) + item.quantity,
    });
  }
  return [...lines.values()];
}

// Totalt antal per produkt, oavsett storlek. Lagret gäller hela produkten.
function totalPerProduct(lines) {
  const totals = new Map();
  for (const line of lines) {
    totals.set(
      line.product_id,
      (totals.get(line.product_id) ?? 0) + line.quantity,
    );
  }
  return totals;
}

// Kastar HttpError om produkten inte går att köpa i det antalet
function assertAvailable(product, quantity) {
  if (product.status !== "approved") {
    throw new HttpError(409, `${product.name} är tyvärr redan såld.`);
  }

  // stock == null betyder att det är second hand
  if (product.stock === null && quantity > 1) {
    throw new HttpError(409, `${product.name} finns bara i ett exemplar.`);
  }
  if (product.stock !== null && product.stock < quantity) {
    throw new HttpError(
      409,
      product.stock === 0
        ? `${product.name} är slut i lager.`
        : `Det finns bara ${product.stock} st av ${product.name} kvar.`,
    );
  }
}

// Produkter med varianter måste ha en av dem vald. Andra har ingen storlek.
function assertValidSize(product, size) {
  const variants = product.variants ?? [];
  if (variants.length === 0) {
    if (size) {
      throw new HttpError(400, `${product.name} finns inte i olika storlekar.`);
    }
    return;
  }
  if (!size) {
    throw new HttpError(400, `Välj en storlek för ${product.name}.`);
  }
  if (!variants.includes(size)) {
    throw new HttpError(400, `${product.name} finns inte i storlek ${size}.`);
  }
}

//HttpError 400/409 om något i varukorgen inte går att köpa
export async function priceCart(items) {
  const merged = mergeLines(items);
  const totals = totalPerProduct(merged);
  const productIds = [...totals.keys()];

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, brand, price, stock, status, seller_id, variants")
    .in("id", productIds);

  if (error) {
    console.error(`Varukorgen: kunde inte läsa produkter: ${error.message}`);
    throw new HttpError(500, "Något gick fel. Försök igen.");
  }

  for (const productId of productIds) {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      throw new HttpError(400, "En produkt i varukorgen finns inte längre.");
    }
    assertAvailable(product, totals.get(productId));
  }

  const lines = merged.map(({ product_id, size, quantity }) => {
    const product = products.find((p) => p.id === product_id);
    assertValidSize(product, size);
    return { product, size, quantity, lineTotal: product.price * quantity };
  });

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  return { lines, subtotal };
}
