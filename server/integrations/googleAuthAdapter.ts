// Google adapter: Enda stället i ReLoved som vet hur Googles inloggning fungerar
import { createHash, randomBytes } from "node:crypto";
import { access } from "node:fs";
import { z } from "zod";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI ?? "";
const TIMEOUT_MS = Number(process.env.GOOGLE_TIMEOUT_MS ?? 10000);

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_ISSUERS = [
  "https://accounts.google.com",
  "accounts.google.com",
] as const;

const SCOPES = "openid email profile";

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
  console.warn(
    "[google] GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET eller GOOGLE_REDIRECT_URI saknas: Google-inloggning fungerar inte.",
  );
}

export class GoogleLoginError extends Error {}

// Starta inloggningen
// Slumpvärde som inte går att gissa
function randomValue(): string {
  return randomBytes(32).toString("base64url");
}

export type LoginAttempt = {
  url: string;
  state: string;
  codeVerifier: string;
  nonce: string;
};

export function startGoogleLogin(): LoginAttempt {
  const state = randomValue();
  const nonce = randomValue();
  const codeVerifier = randomValue();
  const codeChallenge = createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPES,
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  });
  return { url: `${AUTH_URL}?${params}`, state, codeVerifier, nonce };
}

// Byter koden mot tokens på servern
const TokenAnswer = z.object({
  id_token: z.string().min(1),
  access_token: z.string().optional(),
});

async function exchangeCode(
  code: string,
  codeVerifier: string,
): Promise<string> {
  let response: Response;
  try {
    response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
        code_verifier: codeVerifier,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    const reason =
      err instanceof Error && err.name === "TimeoutError"
        ? "timeout"
        : "nätverksfel";
    throw new GoogleLoginError(`Google svarade inte (${reason})`);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new GoogleLoginError(
      `Google nekade kodbytet: status ${response.status} ${data.error ?? ""}`,
    );
  }
  const parsed = TokenAnswer.safeParse(data);
  if (!parsed.success) {
    throw new GoogleLoginError("Google skickade inget ID-token");
  }
  return parsed.data.id_token;
}

// Läser och kontrollerar ID tokenet
const IdTokenClaims = z.object({
  iss: z.enum(GOOGLE_ISSUERS, "ID-tokenet är inte utfärdat av Google"),
  aud: z.literal(CLIENT_ID, "ID-tokenet är inte utfärdat till ReLoved"),
  exp: z.number().int(),
  sub: z.string().min(1).max(255),
  nonce: z.string().optional(),
  email: z.email(),
  email_verified: z.boolean().optional(),
  name: z.string().optional(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
});

// Vår modell av en google kund
export type GoogleProfile = {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
};

function decodePayload(idToken: string): unknown {
  const parts = idToken.split(".");
  if (parts.length !== 3) throw new GoogleLoginError("Id tokenet är ingen JWT");
  try {
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch {
    throw new GoogleLoginError("ID tokenet gick inte att läsa");
  }
}

function verifyIdToken(idToken: string, expectedNonce: string): GoogleProfile {
  const parsed = IdTokenClaims.safeParse(decodePayload(idToken));
  if (!parsed.success) {
    throw new GoogleLoginError(
      `Ogiltigt ID-token: ${parsed.error.issues[0]?.message}`,
    );
  }
  const claims = parsed.data;

  if (claims.exp * 1000 < Date.now() - 60_000) {
    throw new GoogleLoginError("ID tokenet har gått ut");
  }
  if (claims.nonce !== expectedNonce) {
    throw new GoogleLoginError("E-postadressen är inte verifierad hos Google");
  }

  const [first = "", ...rest] = (claims.name ?? "").split(" ");
  return {
    sub: claims.sub,
    email: claims.email.toLowerCase(),
    firstName: (claims.given_name ?? first) || claims.email.split("@")[0],
    lastName: claims.family_name ?? rest.join(" "),
  };
}

export async function finishGoogleLogin(
  code: string,
  { codeVerifier, nonce }: { codeVerifier: string; nonce: string },
): Promise<GoogleProfile> {
  const idToken = await exchangeCode(code, codeVerifier);
  return verifyIdToken(idToken, nonce);
}
