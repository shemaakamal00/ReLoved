export const IMAGE_ACCEPT = "image/jpeg,image/png";
export const MAX_IMAGE_MB = 4;

export function imageFileProblem(file: File): string | null {
  if (!["image/jpeg", "image/png"].includes(file.type)) {
    return "Filen måste vara en bild i formatet JPEG eller PNG.";
  }
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    return `Bilden är för stor. Max ${MAX_IMAGE_MB} MB.`;
  }
  return null;
}
