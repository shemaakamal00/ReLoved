// Kontrollerar vem som är inloggad. Läses ur shoppens httpOnly cookie
import jwt from "jsonwebtoken";
import { readCookie, SESSION_COOKIE } from "../lib/cookies.js";

function userFromCookie(req) {
  const token = readCookie(req, SESSION_COOKIE);
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// Routen kräver inloggninng: Annars 401 utan en giltig cookie
export function requireAuth(req, res, next) {
  const user = userFromCookie(req);

  if (!user) {
    return res.status(401).json({ error: "Du måste vara inloggad" });
  }
  req.user = user;
  next();
}

// Frivliig inloggning
export function optionalAuth(req, res, next) {
  req.user = userFromCookie(req);
  next();
}

// Används efter requireAuth
export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Kräver admin behörighet" });
  }
  next();
}

// Kortform för rotues som bara admin får använda
export const adminOnly = [requireAuth, requireAdmin];
