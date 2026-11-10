//api/auth: registerar och loggar in ed lösenord
import { Router } from "express";
import bcrypt from "bcrypt";
import { supabase } from "../lib/supabase.js";
import { unwrap } from "../lib/db.js";
import { HttpError } from "../lib/http.js";
import { requireAuth } from "../middleware/auth.js";
import { setSessionCookie, clearSessionCookie } from "../lib/cookies.js";

const router = Router();

const PUBLIC_USER_COLUMNS = "id, first_name, last_name, email, role";
const WRONG_LOGIN = "Fel e-post eller lösenord";
const UNIQUE_VIOLATION = "23505";

// Det klienten får veta om användaren
function toPublicUser(user) {
  const { id, first_name, last_name, email, role } = user;
  return { id, first_name, last_name, email, role };
}

// Lösenord
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
      email: email.trim().toLowerCase(),
      password_hash: await bcrypt.hash(password, 10),
      role: "customer",
    })
    .select(PUBLIC_USER_COLUMNS)
    .single();

  if (error?.code === UNIQUE_VIOLATION) {
    throw new HttpError(409, "E-postadressen används redan");
  }
  if (error) throw new Error(`Registrera användare: ${error.message}`);

  setSessionCookie(res, user);
  res.status(201).json({ user });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new HttpError(400, "Fyll i e-post och lösenord");
  }

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .ilike("email", email.trim())
    .maybeSingle();

  // Ett Google-konto har inget lösenord.
  if (!user?.password_hash || !(await bcrypt.compare(password, user.password_hash))) {
    throw new HttpError(401, WRONG_LOGIN);
  }

  setSessionCookie(res, user);
  res.json({ user: toPublicUser(user) });
});

// Vem är inloggad
router.get("/me", requireAuth, async (req, res) => {
  const user = await unwrap(
    supabase
      .from("users")
      .select(PUBLIC_USER_COLUMNS)
      .eq("id", req.user.userId)
      .maybeSingle(),
    "Läsa inloggad användare",
  );
  if (!user) {
    clearSessionCookie(res);
    throw new HttpError(401, "Du måste vara inloggad");
  }
  res.json({ user });
});

router.post("/logout", (req, res) => {
  clearSessionCookie(res);
  res.status(204).end();
});

export default router;
