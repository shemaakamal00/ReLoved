import "dotenv/config";
import express from "express";
import cors from "cors";

import productsRouter from "./routes/products.js";
import ordersRouter from "./routes/orders.js";
import cartRouter from "./routes/cart.js";
import favoritesRouter from "./routes/favorites.js";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import categoriesRouter from "./routes/categories.js";
import adminRouter from "./routes/admin.js";
import sellerRouter from "./routes/seller.js";
import currencyRouter from "./routes/currency.js";

const app = express();

const allowedOrigins = ["http://localhost:5173", "https://re-loved.vercel.app"];

function isAllowedOrigin(origin) {
  if (!origin) return true; // Allow requests with no origin (like mobile apps or curl requests)
  if (allowedOrigins.includes(origin)) return true;
  if (/^https:\/\/re-loved-.*\.vercel\.app$/.test(origin)) return true;
  return false;
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Blockerad av CORS"));
      }
    },
  }),
);

app.use(express.json());

app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/cart", cartRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/admin", adminRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/currency", currencyRouter);

app.use((err, req, res, next) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`${req.method} ${req.originalUrl} misslyckades: ${message}`);
  res.status(500).json({ error: "Något gick fel på servern" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servern körs på http://localhost:${PORT}`);
});
