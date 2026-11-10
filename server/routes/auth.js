//api/auth registera och logga in.
import { Router } from "express";
import bcrypt from "bcrypt";
import { supabase } from "../lib/supabase.js";
import { HttpError } from "../lib/http.js";
import { signToken } from "../middleware/auth.js";

const router = Router();

const PUBLIC_USER_COLUMNS = "id, first_name, last_name, email, role";
const WRONG_LOGIN = "Fel e-post eller lösenord";
const UNIQUE_VIOLATION = "23505";

// Det klienten får veta om användaren
function toPublicUser(user) {
  const { id, first_name, last_name, email, role } = user;
  return { id, first_name, last_name, email, role };
}

router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    throw new HttpError(400, "Fyll i förnamn, efternamn, e-post och lösenord");
  }

  const { data: user, error } = await supabase
    .from("users")
    .insert({
      first_name: firstName,
      last_name: lastName,
      email,
      password_hash: await bcrypt.hash(password, 10),
      role: "customer",
    })
    .select(PUBLIC_USER_COLUMNS)
    .single();

  if (error?.code === UNIQUE_VIOLATION) {
    throw new HttpError(409, "E-postadressen används redan");
  }
  if (error) throw new Error(`Registrera användare: ${error.message}`);

  res.status(201).json({ user, token: signToken(user) });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new HttpError(400, "Fyll i e-post och lösenord");
  }

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  // Samma svar oavsett om e-posten eller lösenordet är fel.
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new HttpError(401, WRONG_LOGIN);
  }

  res.json({ user: toPublicUser(user), token: signToken(user) });
});

export default router;
