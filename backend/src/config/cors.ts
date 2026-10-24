import type { CorsOptions } from "cors";
import { env } from "./env.js";

const extraOrigins = (process.env.CLIENT_URLS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const allowedOrigins = new Set([env.CLIENT_URL, ...extraOrigins]);

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Same-origin / server-to-server requests have no Origin header
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    // Vercel preview + production URLs
    if (/^https:\/\/[\w.-]+\.vercel\.app$/i.test(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
