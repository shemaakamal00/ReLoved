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
router.post("/reindex", async (req, res) => {
  if (!hasCronSecret(req)) throw new HttpError(401, "Ogiltig nyckel");
  const indexed = await reindexAllProducts();
  console.log(`[cron] Sökindexet byggdes om med ${indexed} produkter`);
  res.json({ indexed });
});

export default router;
