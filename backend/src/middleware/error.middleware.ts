import type { NextFunction, Request, Response } from "express";
import { sendError } from "../utils/api-response.js";

export class AppError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode = 500,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json(sendError("Route not found"));
};

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(sendError(err.message, err.errors));
    return;
  }

  // Multer upload errors (file too large, wrong type, etc.)
  if (err.name === "MulterError") {
    res.status(400).json(sendError(err.message));
    return;
  }

  if (
    err.message === "Only video files are allowed" ||
    err.message === "Only image files are allowed" ||
    err.message === "Only PDF/DOC/audio files are allowed" ||
    err.message === "Only PDF/DOC/image note files are allowed"
  ) {
    res.status(400).json(sendError(err.message));
    return;
  }

  console.error("[API Error]", err);
  const message =
    process.env.NODE_ENV === "development" && err.message
      ? err.message
      : "Internal server error";
  res.status(500).json(sendError(message));
};
