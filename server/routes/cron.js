//api/cron körs automatiskt av GitHub Actions
import { Router } from "express";
import { timingSafeEqual } from "node:crypto";
import { HttpError } from "../lib/http.js";
import { reindexAllProducts } from "../services/searchSync.js";

const router = Router();

function hasCronSecret(req) {
  const expected = process.env.CRON_SECRET ?? "";
  const given = (req.headers.authorization ?? "").replace(/^Bearer /, "");
  return (
    expected.length > 0 &&
    given.length === expected.length &&
    timingSafeEqual(Buffer.from(given), Buffer.from(expected))
  );
}

let running = false;

router.post("/reindex", (req, res) => {
  if (!hasCronSecret(req)) throw new HttpError(401, "Ogiltig nyckel");
  if (running)
    return res.status(202).json({ started: false, reason: "Körs redan" });

  running = true;
  res.status(202).json({ started: true });

  reindexAllProducts()
    .then((indexed) =>
      console.log(`[cron] Sökindexet byggdes om med ${indexed} produkter`),
    )
    .catch((err) =>
      console.error(`[cron] Omindexeringen misslyckades: ${err.message}`),
    )
    .finally(() => {
      running = false;
    });
});

export default router;
