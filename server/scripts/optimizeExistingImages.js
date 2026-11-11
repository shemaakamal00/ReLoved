// Ett engångsskript som gör om produktbilderna som redan är inlagda i Supabase Storage till små WebP
import { supabase } from "../lib/supabase.js";
import { optimizeImage } from "../lib/imageOptimizer.js";
import {
  uploadProductImage,
  removeProductImage,
  pathFromPublicUrl,
} from "../integrations/storageAdapter.ts";

const DRY_RUN = process.argv.includes("--dry-run");
const kB = (bytes) => `${Math.round(bytes / 1024)} kB`;

const { data: products, error } = await supabase
  .from("products")
  .select("id, name, image_url, image_path")
  .not("image_url", "is", null);
if (error) throw new Error(`Kunde inte läsa produkter: ${error.message}`);

let done = 0;
let saved = 0;
for (const product of products) {
  const oldPath = product.image_path ?? pathFromPublicUrl(product.image_url);
  if (!oldPath || oldPath.endsWith(".webp")) continue;

  try {
    const response = await fetch(product.image_url, {
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`status ${response.status}`);
    const original = Buffer.from(await response.arrayBuffer());
    const optimized = await optimizeImage(original);
    console.log(
      `${product.id} ${product.name}: ${kB(original.length)} → ${kB(optimized.buffer.length)}`,
    );
    if (DRY_RUN) continue;

    const stored = await uploadProductImage(optimized);
    const { error: updateError } = await supabase
      .from("products")
      .update({ image_path: stored.path, image_url: stored.url })
      .eq("id", product.id);
    if (updateError) {
      await removeProductImage(stored.path).catch(() => {});
      throw new Error(updateError.message);
    }
    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("image_url", product.image_url);
    if (count === 0) {
      await removeProductImage(oldPath).catch((err) =>
        console.warn(
          `  gamla bilden ${oldPath} kunde inte tas bort: ${err.message}`,
        ),
      );
    } else {
      console.log(
        `  gamla bilden används av ${count} produkt(er) till, sparas`,
      );
    }

    done += 1;
    saved += original.length - optimized.buffer.length;
  } catch (err) {
    console.error(
      `${product.id} ${product.name}: hoppades över (${err.message})`,
    );
  }
}

console.log(
  DRY_RUN
    ? "Testkörning klar, inget har ändrats."
    : `Klart: ${done} bilder optimerade, ${kB(saved)} mindre att ladda ner.`,
);
