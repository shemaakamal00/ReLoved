import {
  uploadProductImage,
  removeProductImage,
  pathFromPublicUrl,
} from "../integrations/storageAdapter.ts";

export const IMAGE_SERVICE_DOWN =
  "Bildtjänsten svarar inte just nu. Ingenting har ändrats, försök igen om en stund.";

export async function uploadImage(image) {
  try {
    return { stored: await uploadProductImage(image) };
  } catch (err) {
    console.error(`[bilder] Uppladdning misslyckades: ${err.message}`);
    return { error: IMAGE_SERVICE_DOWN };
  }
}

export async function discardImage(path) {
  if (!path) return;
  try {
    await removeProductImage(path);
    console.log(`[bilder] Tog bort ${path}`);
  } catch (err) {
    console.error(`[bilder] Kunde inte ta bort ${path}: ${err.message}`);
  }
}

export function currentImagePath(product) {
  return product.image_path ?? pathFromPublicUrl(product.image_url);
}
