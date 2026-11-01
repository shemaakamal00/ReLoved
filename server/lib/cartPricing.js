import { z } from "zod";
import { supabase } from "./supabase.js";

export const CartItems = z
  .array(
    z.object({
      product_id: z.number().int().positive("Ogiltig produkt"),
      quantity: z
        .number()
        .int("Antalet måste vara ett heltal")
        .min(1, "Antalet måste vara minst 1")
        .max(10, "Högst 10 av samma produkt"),
    }),
  )
  .min(1, "Varukorgen är tom")
  .max(50, "För många produkter i varukorgen");

export class CartError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function priceCart(items) {
  const quantities = new Map();
  for (const item of items) {
    quantities.set(
      item.product_id,
      (quantities.get(item.product_id) ?? 0) + item.quantity,
    );
  }
  const productIds = [...quantities.keys()];

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, brand, price, stock, status, seller_id")
    .in("id", productIds);
  if (error) {
    console.error(`Varukorgen: kunde inte läsa produkter: ${error.message}`);
    throw new CartError(500, "Något gick fel. Försök igen.");
  }

  const lines = productIds.map((productId) => {
    const product = products.find((p) => p.id === productId);
    const quantity = quantities.get(productId);

    if (!product) {
      throw new CartError(400, "En produkt i varukorgen finns inte längre.");
    }
    if (product.status !== "approved") {
      throw new CartError(409, `${product.name} är tyvärr redan såld.`);
    }
    if (product.stock === null && quantity > 1) {
      throw new CartError(409, `${product.name} finns bara i ett exemplar.`);
    }
    if (product.stock !== null && product.stock < quantity) {
      throw new CartError(
        409,
        product.stock === 0
          ? `${product.name} är slut i lager.`
          : `Det finns bara ${product.stock} st av ${product.name} kvar.`,
      );
    }
    return { product, quantity, lineTotal: product.price * quantity };
  });

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  return { lines, subtotal };
}
