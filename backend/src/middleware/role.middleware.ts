import type { NextFunction, Request, Response } from "express";
import { sendError } from "../utils/api-response.js";

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json(sendError("Authentication required"));
    return;
  }

  if (req.user.role !== "ADMIN") {
    res.status(403).json(sendError("Admin access required"));
    return;
  }

  next();
};

export const requireStudent = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json(sendError("Authentication required"));
    return;
  }

  if (req.user.role !== "STUDENT") {
    res.status(403).json(sendError("Student access required"));
    return;
  }

  next();
};
