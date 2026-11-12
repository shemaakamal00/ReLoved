// Admin rapporterar felen som issues i ReLoved repo
import { supabase } from "../lib/supabase.js";
import { unwrap } from "../lib/db.js";
import { createIssue } from "../integrations/githubAdapter.ts";

// GitHub visar vilken admin som har rapporterat
export async function reportIssue(userId, { title, description }) {
  const admin = await unwrap(
    supabase
      .from("users")
      .select("github_login, first_name")
      .eq("id", userId)
      .single(),
    "Läsa admin",
  );

  const reporter = admin.github_login
    ? `[${admin.github_login}](https://github.com/${admin.github_login})`
    : admin.first_name;

  const body = `${description}\n\n---\nRapporterad av ${reporter} via ReLoveds adminpanel.`;
  return createIssue(title, body);
}
