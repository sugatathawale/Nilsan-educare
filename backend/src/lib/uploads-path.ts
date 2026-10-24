import fs from "node:fs";
import path from "node:path";

/** Local disk in dev; /tmp on Vercel/serverless (only writable path). */
export function uploadsRoot(...parts: string[]): string {
  const base =
    process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
      ? path.join("/tmp", "uploads")
      : path.resolve(process.cwd(), "uploads");
  const dir = path.join(base, ...parts);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function uploadsBase(): string {
  return uploadsRoot();
}
