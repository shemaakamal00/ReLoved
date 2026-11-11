// Gör om produkterbilderna små innan de sparas
import sharp from "sharp";

const MAX_SIDE = 1200;
const QUALITY = 80;

export async function optimizeImage(buffer) {
  const output = await sharp(buffer)
    .rotate()
    .resize({
      width: MAX_SIDE,
      height: MAX_SIDE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: QUALITY })
    .toBuffer(); // Tar bort GPS position 

  return { buffer: output, mimeType: "image/webp" };
}
