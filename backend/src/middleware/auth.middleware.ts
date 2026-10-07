import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { verifyToken } from "../lib/jwt.js";
import { sendError } from "../utils/api-response.js";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token =
    req.cookies?.[env.COOKIE_NAME] ??
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json(sendError("Authentication required"));
    return;
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json(sendError("Invalid or expired token"));
  }
};

export const optionalAuthenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const token =
    req.cookies?.[env.COOKIE_NAME] ??
    req.headers.authorization?.replace("Bearer ", "");

  if (token) {
    try {
      req.user = verifyToken(token);
    } catch {
      // ignore invalid token for optional auth
    }
  }

  next();
};
