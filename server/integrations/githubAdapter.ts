// Enda stället som vet hur GitHubs inloggning och API:et fungerar
import { log } from "node:console";
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";

const CLIENT_ID = process.env.GITHUB_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET ?? "";
const REDIRECT_URI = process.env.GITHUB_REDIRECT_URI ?? "";
const TIMEOUT_MS = Number(process.env.GITHUB_TIMEOUT_MS ?? 10000);

const AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const TOKEN_URL = "https://github.com/login/oauth/access_token";
const API_URL = "https://api.github.com";

const SCOPES = "read: user";

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
  console.warn(
    "[github] GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET eller GITHUB_REDIRECT_URI saknas: admininloggning fungerar inte.",
  );
}

export class GitHubError extends Error {}

function randomValue(): string {
  return randomBytes(32).toString("base64url");
}

// Alla anrop till GitHub går hit
async function callGitHub(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    const reason =
      err instanceof Error && err.name === "TimeoutError"
        ? "timeout"
        : "nätverksfel";
    throw new GitHubError(`GitHub svarade inte (${reason})`);
  }
}

// Startar inloggningen
export type GitHubLoginAttempt = {
  url: string;
  state: string;
  codeVerifier: string;
};

export function startGitHubLogin(): GitHubLoginAttempt {
  const state = randomValue();
  const codeVerifier = randomValue();
  const codeChallenge = createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    allow_signup: "false",
  });
  return { url: `${AUTHORIZE_URL}?${params}`, state, codeVerifier };
}

// Byter ut koden mot en token
const TokenAnswer = z.object({
  access_token: z.string().min(1),
  scope: z.string().optional(),
});
const TokenFailure = z.object({
  error: z.string(),
  error_description: z.string().optional(),
});

async function exchangeCode(
  code: string,
  codeVerifier: string,
): Promise<string> {
  const response = await callGitHub(TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  });

  const data = await response.json().catch(() => ({}));

  // GitHub svarar med 200 om kodbytet misslyckas
  const failure = TokenFailure.safeParse(data);
  if (!response.ok || failure.success) {
    const reason = failure.success
      ? failure.data.error
      : `status ${response.status}`;
    throw new GitHubError(`GitHub nekade kodbytet: ${reason}`);
  }

  const parsed = TokenAnswer.safeParse(data);
  if (!parsed.success)
    throw new GitHubError("GitHub skickade ingen access token");
  return parsed.data.access_token;
}

// Hämtar den inloggade användaren
const GitHubUser = z.object({
  id: z.number().int().positive(),
  login: z.string().min(1).max(39),
  name: z.string().max(255).nullable(),
});

// Vår modell av en GitHub användare
export type GitHubProfile = {
  id: number;
  login: string;
  name: string;
};

async function fetchGitHubUser(accessToken: string): Promise<GitHubProfile> {
  const response = await callGitHub(`${API_URL}/user`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "ReLoved",
    },
  });
  if (!response.ok) {
    throw new GitHubError(`GitHub svarade ${response.status} på /user`);
  }

  const parsed = GitHubUser.safeParse(await response.json().catch(() => null));
  if (!parsed.success)
    throw new GitHubError("GitHub skickade en ogiltig användare");

  const { id, login, name } = parsed.data;
  return { id, login, name: name?.trim() || login };
}

// Här används admins token som i sin tur inte sparas
export async function finishGitHubLogin(
  code: string,
  codeVerifier: string,
): Promise<GitHubProfile> {
  const accessToken = await exchangeCode(code, codeVerifier);
  return fetchGitHubUser(accessToken);
}

// Issues i ReLoveds repo med shoppens egna token
const SHOP_TOKEN = process.env.GITHUB_ISSUES_TOKEN ?? "";
const SHOP_REPO = process.env.GITHUB_REPO ?? "";

if (!SHOP_TOKEN || !SHOP_REPO) {
  console.warn(
    "[github] GITHUB_ISSUES_TOKEN eller GITHUB_REPO saknas: issues fungerar inte.",
  );
}

// Begripliga felmeddelanden för admin, inga råa svar
function issueError(status: number): GitHubError {
  switch (status) {
    case 401:
      return new GitHubError(
        "Shoppens GitHub-token är ogiltig eller har gått ut.",
      );
    case 403:
      return new GitHubError(
        "Shoppens GitHub-token saknar behörighet till ärenden i repot.",
      );
    case 404:
      return new GitHubError(
        "Repot kunde inte hittas. Kontrollera GITHUB_REPO och att token har åtkomst till repot.",
      );
    case 410:
      return new GitHubError("Ärenden är avstängda i GitHub repot. Slå på Issues under Settings.");
    case 422:
      return new GitHubError(
        "GitHub godkände inte felrapporten. Kontrollera rubriken och beskrivningen.",
      );
    default:
      return new GitHubError(
        `GitHub svarade med status ${status}. Försök igen om en stund.`,
      );
  }
}

// Anropen mot shoppens repo går hit
async function callShopRepo(
  path: string,
  init: RequestInit = {},
): Promise<unknown> {
  if (!SHOP_TOKEN || !SHOP_REPO) {
    throw new GitHubError(
      "Felrapporter är inte inställda på servern (GITHUB_ISSUES_TOKEN eller GITHUB_REPO saknas).",
    );
  }

  const response = await callGitHub(`${API_URL}/repos/${SHOP_REPO}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${SHOP_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "ReLoved",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });

  if (!response.ok) {
    console.warn(
      `[github] ${init.method ?? "GET"} ${path} svarade ${response.status}`,
    );
    throw issueError(response.status);
  }
  return response.json().catch(() => null);
}

const GitHubIssue = z.object({
  number: z.number().int(),
  title: z.string(),
  html_url: z.url(),
  created_at: z.string(),
  pull_request: z.unknown().optional(),
});

// Min modell av en issue
export type Issue = {
  number: number;
  title: string;
  url: string;
  createdAt: string;
};

function toIssue(raw: z.infer<typeof GitHubIssue>): Issue {
  return {
    number: raw.number,
    title: raw.title,
    url: raw.html_url,
    createdAt: raw.created_at,
  };
}

// Skapar en issue
export async function createIssue(title: string, body: string): Promise<Issue> {
  const data = await callShopRepo("/issues", {
    method: "POST",
    body: JSON.stringify({ title, body }),
  });

  const parsed = GitHubIssue.safeParse(data);
  if (!parsed.success) {
    throw new GitHubError(
      "GitHub skickade ett oväntat svar när felrapporten skapades.",
    );
  }
  return toIssue(parsed.data);
}

// Listar repots öppna issues
export async function listOpenIssues(): Promise<Issue[]> {
  const data = await callShopRepo(
    "/issues?state=open&sort=created&direction=desc&per_page=50",
  );

  const parsed = z.array(GitHubIssue).safeParse(data);
  if (!parsed.success) {
    throw new GitHubError(
      "GitHub skickade ett oväntat svar när ärendena hämtades.",
    );
  }

  // PR säknas också som issues
  return parsed.data.filter((item) => !item.pull_request).map(toIssue);
}
