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

  console.error(err);
  res.status(500).json(sendError("Internal server error"));
};
