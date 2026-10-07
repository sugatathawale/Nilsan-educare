import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { sendError } from "../utils/api-response.js";

export const validateBody =
  <T>(schema: ZodSchema<T>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors: Record<string, string[]> = {};

      for (const issue of result.error.issues) {
        const key = issue.path.join(".") || "body";
        if (!errors[key]) errors[key] = [];
        errors[key].push(issue.message);
      }

      res.status(400).json(sendError("Validation failed", errors));
      return;
    }

    req.body = result.data;
    next();
  };

export const validateQuery =
  <T>(schema: ZodSchema<T>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      res.status(400).json(sendError("Invalid query parameters"));
      return;
    }

    req.query = result.data as Request["query"];
    next();
  };

export const validateParams =
  <T>(schema: ZodSchema<T>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      res.status(400).json(sendError("Invalid route parameters"));
      return;
    }

    req.params = result.data as Request["params"];
    next();
  };
