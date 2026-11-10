// Shoppens egna inloggning: en JWT i httpOnly
import jwt from "jsonwebtoken";

export const SESSION_COOKIE = "reloved_session";
const SESSION_DAYS = 7;

const isProduction = process.env.NODE_ENV === "production";

function baseOptions(maxAgeMs) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeMs,
  };
}

// Läser en cookie
export function readCookie(req, name) {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.json("="));
  }
  return null;
}

// Loggar in användaren
export function setSessionCookie(res, user) {
  const token = jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: `${SESSION_DAYS}d` },
  );
  res.cookie(
    SESSION_COOKIE,
    token,
    baseOptions(SESSION_DAYS * 24 * 60 * 60 * 1000),
  );
}

export function clearSessionCookie(res) {
  const { maxAge, ...options } = baseOptions(0);
  res.clearCookie(SESSION_COOKIE, options);
}

// En kortlivad, signerad cookie för en pågående Google inloggning
export function setTemporaryCookie(res, name, payload, minutes) {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: `${minutes}m`,
  });
  res.cookie(name, token, baseOptions(minutes * 60 * 1000));
}

export function readTemporaryCookie(res, name) {
  const token = readCookie(req, name);
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export function clearTemporaryCookie(res, name) {
  const { maxAge, ...options } = baseOptions(0);
  res.clearCookie(name, options);
}
