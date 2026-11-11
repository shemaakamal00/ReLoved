//api/auth/github för att admin ska kunna logga in med GitHub
import { Router } from "express";
import {
  setSessionCookie,
  setTemporaryCookie,
  readTemporaryCookie,
  clearTemporaryCookie,
} from "../lib/cookies.js";
import {
  startGitHubLogin,
  finishGitHubLogin,
  GitHubError,
} from "../integrations/githubAdapter.ts";
import { saveGithubAdmin, NotAdminError } from "../services/githubAdmins.js";

const router = Router();

const ATTEMPT_COOKIE = "reloved_github_login";
const ATTEMPT_MINUTES = 10;

// Tillbaka till inloggningssidan med en felkod
function loginFailed(res, code) {
  clearTemporaryCookie(res, ATTEMPT_COOKIE);
  res.redirect(`/login?error=${code}`);
}

// "Logga in med GitHub" länken
router.get("/", (req, res) => {
  const { url, state, codeVerifier } = startGitHubLogin();
  setTemporaryCookie(
    res,
    ATTEMPT_COOKIE,
    { state, codeVerifier },
    ATTEMPT_MINUTES,
  );
  res.redirect(url);
});

//GitHub skickar tillbaka admin hit
router.get("/callback", async (req, res) => {
  const { code, state, error } = req.query;
  const attempt = readTemporaryCookie(req, ATTEMPT_COOKIE);

  // Om admin klickar "Cancel"
  if (error === "access_denied") return loginFailed(res, "github_cancelled");
  if (error) {
    console.warn(
      `[github] GitHub svarade med fel: ${String(error).slice(0, 100)}`,
    );
    return loginFailed(res, "github_failed");
  }

  // State måste vara exakt det vi har sparat annars avbryts inloggningen
  if (!attempt || typeof state !== "string" || state !== attempt.state) {
    console.warn(
      "[github] state matchar inte, eller inloggningen tog för lång tid",
    );
    return loginFailed(res, "github_expired");
  }
  if (typeof code !== "string" || !code)
    return loginFailed(res, "github_failed");

  try {
    const profile = await finishGitHubLogin(code, attempt.codeVerifier);
    const admin = await saveGithubAdmin(profile);

    // ReLoved inloggning med samma httpOnly cookie
    clearTemporaryCookie(res, ATTEMPT_COOKIE);
    setSessionCookie(res, admin);
    console.log(`[github] ${profile.login} inloggad som admin`);
    res.redirect("/admin");
  } catch (err) {
    if (err instanceof NotAdminError) {
      console.warn(
        `[github] ${err.message} försökte logga in men är inte admin`,
      );
      return loginFailed(res, "not_admin");
    }
    console.error(`[github] ${err.message}`);
    loginFailed(res, err instanceof GitHubError ? "github_failed" : "server");
  }
});

export default router;
