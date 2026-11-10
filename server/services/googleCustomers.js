// Google kunder i vår databas
import { supabase } from "../lib/supabase.js";
import { unwrap } from "../lib/db.js";

const PUBLIC_USER_COLUMNS = "id, first_name, last_name, email, role";
const UNIQUE_VIOLATION = "23505";

export class EmailTakenError extends Error {}

// Om e-posten finns redan så slås inte kontorna automatisk ihop
export async function findOrCreateGoogleCustomer(profile) {
  const existing = await unwrap(
    supabase
      .from("users")
      .select(PUBLIC_USER_COLUMNS)
      .eq("google_sub", profile.sub)
      .maybeSingle(),
    "Läsa Google-kund",
  );
  if (existing) return existing;

  // Första inloggningen skaps en ny kund med sub, e-post och namn
  const { data: created, error } = await supabase
    .from("users")
    .insert({
      google_sub: profile.sub,
      email: profile.email,
      first_name: profile.firstName,
      last_name: profile.lastName,
      password_hash: null,
      role: "customer",
    })
    .select(PUBLIC_USER_COLUMNS)
    .single();

  if (error?.code === UNIQUE_VIOLATION)
    throw new EmailTakenError(profile.email);
  if (error) throw new Error(`Skapa Google-kund: ${error.message}`);

  console.log(`[google] Ny kund ${created.id} skapad`);
  return created;
}
