// api/admin statistik, leverantörsimport och sökindex.
import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { countRows } from "../lib/db.js";
import { HttpError } from "../lib/http.js";
import { adminOnly } from "../middleware/auth.js";
import {
  IMPORT_FORMATS,
  importSupplierCatalog,
} from "../services/supplierImport.js";
import { reindexAllProducts } from "../services/searchSync.js";

const router = Router();
router.use(adminOnly);

router.get("/stats", async (req, res) => {
  const count = (table) =>
    supabase.from(table).select("*", { count: "exact", head: true });

  const [pending, active, orders, users] = await Promise.all([
    countRows(count("products").eq("status", "pending")),
    countRows(count("products").eq("status", "approved")),
    countRows(count("orders")),
    countRows(count("users")),
  ]);

  res.json({ pending, active, orders, users });
});

router.post("/products/import/:format", async (req, res) => {
  const { format } = req.params;
  if (!IMPORT_FORMATS.includes(format)) {
    throw new HttpError(400, "Formatet måste vara csv eller xml");
  }
  res.json(await importSupplierCatalog(format));
});

router.post("/search/reindex", async (req, res) => {
  try {
    const indexed = await reindexAllProducts();
    console.log(`Sökindexet byggdes om med ${indexed} produkter`);
    res.json({ indexed });
  } catch (err) {
    console.error(`Kunde inte bygga om sökindexet: ${err.message}`);
    throw new HttpError(
      502,
      "Kunde inte uppdatera sökindexet. Försök igen om en stund.",
    );
  }
});

export default router;
