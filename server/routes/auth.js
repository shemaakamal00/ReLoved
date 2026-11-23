//api/auth: registerar och loggar in ed lösenord
import { Router } from "express";
import bcrypt from "bcrypt";
import { supabase } from "../lib/supabase.js";
import { unwrap } from "../lib/db.js";
import { HttpError, parseOr400 } from "../lib/http.js";
import { optionalAuth } from "../middleware/auth.js";
import { setSessionCookie, clearSessionCookie } from "../lib/cookies.js";
import { z } from "zod";
import {
  requestPasswordReset,
  resetPassword,
} from "../services/passwordReset.js";

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

  if (password.length < 8) {
    throw new HttpError(400, "Lösenordet behöver minst 8 tecken");
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
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  // Ett Google-konto har inget lösenord.
  if (
    !user?.password_hash ||
    !(await bcrypt.compare(password, user.password_hash))
  ) {
    throw new HttpError(401, WRONG_LOGIN);
  }

  setSessionCookie(res, user);
  res.json({ user: toPublicUser(user) });
});

// Vem är inloggad
router.get("/me", optionalAuth, async (req, res) => {
  if (!req.user) return res.json({ user: null });
  const user = await unwrap(
    supabase
      .from("users")
      .select(PUBLIC_USER_COLUMNS)
      .eq("id", req.user.userId)
      .maybeSingle(),
    "Läsa inloggad användare",
  );
  if (!user) clearSessionCookie(res);
  res.json({ user: user ?? null });
});

router.post("/logout", (req, res) => {
  clearSessionCookie(res);
  res.status(204).end();
});

// Glömt lösenord
const ForgotPassword = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Ange en giltig e-postadress")),
});

const ResetPassword = z.object({
  token: z.string().min(20, "Länken är ogiltig").max(200),
  password: z
    .string()
    .min(8, "Lösenordet behöver minst 8 tecken")
    .max(200, "Lösenordet är för långt"),
});

// Samma svar oavsett om kontot finns, och mejlet skickas i bakgrunden
router.post("/forgot-password", (req, res) => {
  const { email } = parseOr400(ForgotPassword, req.body);
  requestPasswordReset(email).catch((err) =>
    console.error(`[lösenord] Återställning misslyckades: ${err.message}`),
  );
  res.json({
    message:
      "Om adressen har ett konto hos oss har vi skickat en länk. Kolla din inkorg.",
  });
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = parseOr400(ResetPassword, req.body);
  await resetPassword(token, password);
  res.json({ message: "Lösenordet är bytt. Logga in med ditt nya lösenord." });
});

export default router;
