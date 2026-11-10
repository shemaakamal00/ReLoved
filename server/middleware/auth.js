import jwt from "jsonwebtoken";

const TOKEN_LIFETIME = "7d";

//Skapar en token för en användare.
export function signToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_LIFETIME },
  );
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Du måste vara inloggad" });
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Du har loggats ut. Logga in igen." });
  }
}

// Används efter requireAuth
export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Kräver admin-behörighet" });
  }
  next();
}

// Kortform för rotues som bara admin får använda
export const adminOnly = [requireAuth, requireAdmin];
