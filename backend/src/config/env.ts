import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  API_PREFIX: z.string().default("/api/v1"),
  CLIENT_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("7d"),
  COOKIE_NAME: z.string().default("nilsan_auth_token"),
  ADMIN_EMAIL: z.string().email().default("admin@nilsaneducare.com"),
  ADMIN_PASSWORD: z.string().min(6).default("admin123"),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  BUNNY_STREAM_LIBRARY_ID: z.string().optional(),
  BUNNY_STREAM_API_KEY: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export const isRazorpayConfigured = Boolean(
  env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET
);
