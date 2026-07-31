import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { supabase } from "../lib/supabase.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res
      .status(400)
      .json({ error: "Fyll i förnamn, efternamn, e-post och lösenord" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert({
      first_name: firstName,
      last_name: lastName,
      email,
      password_hash: passwordHash,
      role: "customer",
    })
    .select("id, first_name, last_name, email, role")
    .single();

  if (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "E-postadressen används redan" });
    }
    return res.status(500).json({ error: error.message });
  }

  const token = jwt.sign(
    { userId: data.id, role: data.role, email: data.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
  res.status(201).json({ user: data, token });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Fyll i e-post och lösenord" });
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) {
    return res.status(401).json({ error: "Fel e-post eller lösenord" });
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    return res.status(401).json({ error: "Fel e-post eller lösenord" });
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
  res.json({
    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
    },
    token,
  });
});

export default router;