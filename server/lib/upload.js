import multer from "multer";

export const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const MAX_IMAGE_MB = MAX_IMAGE_SIZE / (1024 * 1024);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE, files: 1 },
});

export function receiveImage(req, res, next) {
  upload.single("image")(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: `Bilden är för stor. Max ${MAX_IMAGE_MB} MB.` });
    }
    if (err) {
      return res.status(400).json({
        error: "Kunde inte läsa filen. Skicka en bild i fältet image.",
      });
    }
    next();
  });
}

const SIGNATURES = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
};

function detectImageType(buffer) {
  for (const [mimeType, signature] of Object.entries(SIGNATURES)) {
    if (signature.every((byte, i) => buffer[i] === byte)) return mimeType;
  }
  return null;
}

export function validateImage(file) {
  if (!file) return { image: null };

  const detected = detectImageType(file.buffer);
  if (!detected || detected !== file.mimetype) {
    return { error: "Filen måste vara en bild i formatet JPEG eller PNG." };
  }
  return { image: { buffer: file.buffer, mimeType: detected } };
}
