//Produktbilder
import {
  uploadProductImage,
  removeProductImage,
  pathFromPublicUrl,
} from "../integrations/storageAdapter.ts";
import { validateImage } from "../lib/upload.js";
import { HttpError } from "../lib/http.js";
import { optimizeImage } from "../lib/imageOptimizer.js";

export const IMAGE_SERVICE_DOWN =
  "Bildtjänsten svarar inte just nu. Ingenting har ändrats, försök igen om en stund.";

// Tar emot filen från multer och kontrollerar den
export async function storeUploadedImage(file) {
  const { image, error } = validateImage(file);
  if (error) throw new HttpError(400, error);
  if (!image) return null;

  let optimized;
  try {
    optimized = await optimizeImage(image.buffer);
  } catch (err) {
    console.error(`[bilder] Kunde inte läsa bilden: ${err.message}`);
    throw new HttpError(
      400,
      "Bilden gick inte att läsa. Prova en annan JPEG eller PNG.",
    );
  }

  try {
    return await uploadProductImage(optimized);
  } catch (err) {
    console.error(`[bilder] Uppladdning misslyckades: ${err.message}`);
    throw new HttpError(502, IMAGE_SERVICE_DOWN);
  }
}

// Tar bort en bild, misslyckas det så loggas felet, men inget kastas.
export async function discardImage(path) {
  if (!path) return;
  try {
    await removeProductImage(path);
    console.log(`[bilder] Tog bort ${path}`);
  } catch (err) {
    console.error(`[bilder] Kunde inte ta bort ${path}: ${err.message}`);
  }
}

// Var produktens bild ligger
export function currentImagePath(product) {
  return product.image_path ?? pathFromPublicUrl(product.image_url);
}
