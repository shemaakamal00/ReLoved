// /api/users/me – den inloggade användarens profil.
import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { unwrap } from "../lib/db.js";
import { HttpError } from "../lib/http.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const PROFILE_COLUMNS =
  "id, first_name, last_name, email, address, postal_code, city, role";

router.get("/me", async (req, res) => {
  const profile = await unwrap(
    supabase
      .from("users")
      .select(PROFILE_COLUMNS)
      .eq("id", req.user.userId)
      .maybeSingle(),
    "Läsa profil",
  );
  if (!profile) throw new HttpError(404, "Användaren hittades inte");
  res.json(profile);
});

router.patch("/me", async (req, res) => {
  const { first_name, last_name, address, postal_code, city } = req.body;

  res.json(
    await unwrap(
      supabase
        .from("users")
        .update({ first_name, last_name, address, postal_code, city })
        .eq("id", req.user.userId)
        .select(PROFILE_COLUMNS)
        .single(),
      "Uppdatera profil",
    ),
  );
});

export default router;
