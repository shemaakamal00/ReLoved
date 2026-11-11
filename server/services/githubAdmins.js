// Regeln om vem som får vara admin
import { supabase } from "../lib/supabase.js";
import { unwrap } from "../lib/db.js";

const PUBLIC_USER_COLUMNS = "id, first_name, last_name, email, role";

const ADMIN_LOGINS = new Set(
  (process.env.ADMIN_GITHUB_LOGINS ?? "")
    .split(",")
    .map((login) => login.trim().toLowerCase())
    .filter(Boolean),
);

if (ADMIN_LOGINS.size === 0) {
  console.warn(
    "[github] ADMIN_GITHUB_LOGINS är tom: ingen kan logga in som admin.",
  );
}

export class NotAdminError extends Error {}

// GitHub inte så skiftlägeskänslig
function isAllowedAdmin(login) {
  return ADMIN_LOGINS.has(login.toLowerCase());
}

// Admin sparas med GitHubs id
export async function saveGithubAdmin(profile) {
  if (!isAllowedAdmin(profile.login)) throw new NotAdminError(profile.login);

  return unwrap(
    supabase
      .from("users")
      .upsert(
        {
          github_id: profile.id,
          github_login: profile.login,
          first_name: profile.name.slice(0, 100),
          last_name: "",
          role: "admin",
        },
        { onConflict: "github_id" },
      )
      .select(PUBLIC_USER_COLUMNS)
      .single(),
    "Spara admin",
  );
}
