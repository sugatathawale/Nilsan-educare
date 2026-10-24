import fs from "node:fs/promises";
import path from "node:path";
import type { NextApiRequest, NextApiResponse } from "next";

function uploadsBase() {
  return process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
    ? path.join("/tmp", "uploads")
    : path.resolve(process.cwd(), "backend", "uploads");
}

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4"
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    res.status(405).end("Method Not Allowed");
    return;
  }

  const parts = req.query.path;
  const segments = Array.isArray(parts) ? parts : parts ? [parts] : [];
  if (segments.some((part) => part.includes("..") || part.includes("\0"))) {
    res.status(400).end("Invalid path");
    return;
  }

  const base = uploadsBase();
  const filePath = path.resolve(base, ...segments);
  if (!filePath.startsWith(path.resolve(base))) {
    res.status(400).end("Invalid path");
    return;
  }

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=604800");
    if (req.method === "HEAD") {
      res.status(200).end();
      return;
    }
    res.status(200).send(data);
  } catch {
    res.status(404).end("Not found");
  }
}
