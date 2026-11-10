import { Router } from "express";
import {
  setSessionCookie,
  setTemporaryCookie,
  readTemporaryCookie,
  clearTemporaryCookie,
} from "../lib/cookies.js";
import {
  startGoogleLogin,
  finishGoogleLogin,
  GoogleLoginError,
} from "../integrations/googleAuthAdapter.ts";
import {
  findOrCreateGoogleCustomer,
  EmailTakenError,
} from "../services/googleCustomers.js";

const router = Router();

const ATTEMPT_COOKIE = "reloved_google_login";
const ATTEMPT_MINUTES = 10;

// En sökväg i ReLoved
function safeReturnPath(value) {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
    ? value
    : "/";
}

// Tillbaka till inloggningssidan med ett begripligt felkod
function loginFailed(res, code) {
  clearTemporaryCookie(res, ATTEMPT_COOKIE);
  res.redirect(`/login?error=${code}`);
}

// Länken "Fortsätt med Google"
router.get("/", (req, res) => {
  const { url, state, codeVerifier, nonce } = startGoogleLogin();
  setTemporaryCookie(
    res,
    ATTEMPT_COOKIE,
    {
      state,
      codeVerifier,
      nonce,
      returnTo: safeReturnPath(req.query.returnTo),
    },
    ATTEMPT_MINUTES,
  );
  res.redirect(url);
});

// Google skickar tillbaka kunden hit
router.get("/callback", async (req, res) => {
  const { code, state, error } = req.query;
  const attempt = readTemporaryCookie(req, ATTEMPT_COOKIE);

  // Kunden klickade "Avbryt" hos Google
  if (error === "access_denied") return loginFailed(res, "google_cancelled");
  if (error) {
    console.warn(
      `[google] Google svarade med fel: ${String(error).slice(0, 100)}`,
    );
    return loginFailed(res, "google_failed");
  }

  // state måste vara exkat det vi sparade annars loggas man inte in
  if (!attempt || typeof state !== "string" || state !== attempt.state) {
    console.warn(
      "[google] state matchar inte, eller inloggningen tog för lång tid",
    );
    return loginFailed(res, "google_expired");
  }
  if (typeof code !== "string" || !code)
    return loginFailed(res, "google_failed");

  try {
    const profile = await finishGoogleLogin(code, attempt);
    const user = await findOrCreateGoogleCustomer(profile);

    // ReLoveds egna inloggning
    clearTemporaryCookie(res, ATTEMPT_COOKIE);
    setSessionCookie(res, user);
    res.redirect(attempt.returnTo);
  } catch (err) {
    if (err instanceof EmailTakenError) return loginFailed(res, "email_taken");
    console.error(`[google] ${err.message}`);
    loginFailed(
      res,
      err instanceof GoogleLoginError ? "google_failed" : "server",
    );
  }
});

export default router;
