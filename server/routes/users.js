import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("users")
    .select(
      "id, first_name, last_name, email, address, postal_code, city, role",
    )
    .eq("id", req.user.userId)
    .single();

  if (error) return res.status(404).json({ error: "Användaren hittades inte" });
  res.json(data);
});

router.patch("/me", requireAuth, async (req, res) => {
  const { first_name, last_name, address, postal_code, city } = req.body;

  const { data, error } = await supabase
    .from("users")
    .update({ first_name, last_name, address, postal_code, city })
    .eq("id", req.user.userId)
    .select(
      "id, first_name, last_name, email, address, postal_code, city, role",
    )
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;