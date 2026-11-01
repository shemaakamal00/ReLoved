import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SECRET_KEY = process.env.SUPABASE_SERVICE_KEY ?? "";
const BUCKET = process.env.SUPABASE_BUCKET ?? "products";
const TIMEOUT_MS = Number(process.env.SUPABASE_STORAGE_TIMEOUT_MS ?? 10000);

const supabase = createClient(SUPABASE_URL, SECRET_KEY, {
  global: {
    fetch: (input, init) =>
      fetch(input, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) }),
  },
});

export type ImageFile = {
  buffer: Buffer;
  mimeType: "image/jpeg" | "image/png";
};

export type StoredImage = {
  path: string;
  url: string;
};

const EXTENSIONS: Record<ImageFile["mimeType"], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
};

export async function uploadProductImage(
  image: ImageFile,
): Promise<StoredImage> {
  const path = `${randomUUID()}.${EXTENSIONS[image.mimeType]}`;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, image.buffer, {
      contentType: image.mimeType,
    });

  if (error) {
    throw new Error(`Kunde inte ladda upp bilden: ${error.message}`);
  }
  if (!data?.path) {
    throw new Error("Supabase svarade utan sökväg till bilden");
  }

  const { data: publicUrl } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path);
  return { path: data.path, url: publicUrl.publicUrl };
}

export async function removeProductImage(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    throw new Error(`Kunde inte ta bort bilden ${path}: ${error.message}`);
  }
}

export function pathFromPublicUrl(url: string | null): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  return index === -1
    ? null
    : decodeURIComponent(url.slice(index + marker.length));
}
