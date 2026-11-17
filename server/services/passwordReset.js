// Återställning av lösenord med en engångslänk via e-post
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
import { supabase } from "../lib/supabase.js";
import { unwrap } from "../lib/db.js";
import { HttpError } from "../lib/http.js";
import { sendEmail } from "../integrations/emailAdapter.ts";
import { passwordResetEmail } from "../emails/passwordReset.js";

const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";
const VALID_MINUTES = 30;
const WAIT_MINUTES = 2;
const INVALID_LINK = "Länken är ogiltig eller har gått ut. Be om en ny länk.";

// Koden i länken sparas aldrig
function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function minutesFromNow(minutes) {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

// Skickar en länk om kontot finns och har ett lösenord. Berättar inte om kontot inte finns
export async function requestPasswordReset(email) {
  const user = await unwrap(
    supabase
      .from("users")
      .select("id, first_name, email, password_hash")
      .eq("email", email)
      .maybeSingle(),
    "Läsa konto för återställning",
  );

  // Google och GitHub har inget lösenord
  // Google- och GitHub-konton har inget lösenord hos oss
  if (!user?.password_hash) {
    console.log("[lösenord] Ingen länk skickad: inget konto med lösenord för adressen");
    return;
  }

  // Skydd mot att någon fyller en inkorg med mejl
  const recent = await unwrap(
    supabase
      .from("password_resets")
      .select("id")
      .eq("user_id", user.id)
      .gte("created_at", minutesFromNow(-WAIT_MINUTES))
      .limit(1),
    "Läsa senaste återställning",
  );
  if (recent.length > 0) {
    console.log(`[lösenord] Ingen länk skickad: konto ${user.id} fick en länk nyss`);
    return;
  }

  const token = randomBytes(32).toString("base64url");
  const reset = await unwrap(
    supabase
      .from("password_resets")
      .insert({
        user_id: user.id,
        token_hash: hashToken(token),
        expires_at: minutesFromNow(VALID_MINUTES),
      })
      .select("id")
      .single(),
    "Spara återställning",
  );

  const link = `${CLIENT_URL}/reset-password?token=${token}`;
  const { subject, html, text } = passwordResetEmail({
    firstName: user.first_name,
    link,
    minutes: VALID_MINUTES,
  });
  await sendEmail({
    to: user.email,
    subject,
    html,
    text,
    idempotencyKey: `password-reset/${hashToken(token).slice(0, 32)}`,
  });
  console.log(`[lösenord] Återställningslänk skickad till konto ${user.id}`);
}

// Byter lösenord om länken är giltig för att sedan spärra den
export async function resetPassword(token, password) {
  const reset = await unwrap(
    supabase
      .from("password_resets")
      .select("id, user_id, expires_at, used_at")
      .eq("token_hash", hashToken(token))
      .maybeSingle(),
    "Läsa återställning",
  );
  if (!reset || reset.used_at || new Date(reset.expires_at) < new Date()) {
    throw new HttpError(400, INVALID_LINK);
  }

  // Spärra länken först
  const claimed = await unwrap(
    supabase
      .from("password_resets")
      .update({ used_at: new Date().toISOString() })
      .eq("id", reset.id)
      .is("used_at", null)
      .select("id"),
    "Spärra länken",
  );
  if (claimed.length === 0) throw new HttpError(400, INVALID_LINK);

  await unwrap(
    supabase
      .from("users")
      .update({ password_hash: await bcrypt.hash(password, 10) })
      .eq("id", reset.user_id),
    "Byta lösenord",
  );

  // Andra länkar till samma konto slutar att gälla
  await unwrap(
    supabase
      .from("password_resets")
      .update({ used_at: new Date().toISOString() })
      .eq("user_id", reset.user_id)
      .is("used_at", null),
    "Spärra andra länkar",
  );
  console.log(`[lösenord] Lösenordet bytt för konto ${reset.user_id}`);
}
