// Själva starten (app.listen) finns i server.js.
import express from "express";
import cors from "cors";

import apiRouter from "./routes/index.js";
import webhookRouter from "./routes/webhook.js";
import { errorHandler } from "./lib/http.js";

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://re-loved.vercel.app",
];
const VERCEL_PREVIEW = /^https:\/\/re-loved-.*\.vercel\.app$/;

function isAllowedOrigin(origin) {
  if (!origin) return true;
  return ALLOWED_ORIGINS.includes(origin) || VERCEL_PREVIEW.test(origin);
}

const app = express();

app.use(
  cors({
    origin: (origin, callback) =>
      isAllowedOrigin(origin)
        ? callback(null, true)
        : callback(new Error("Blockerad av CORS")),
  }),
);

app.use("/api/stripe/webhook", webhookRouter);

app.use(express.json());
app.use("/api", apiRouter);

app.use(errorHandler);

export default app;
