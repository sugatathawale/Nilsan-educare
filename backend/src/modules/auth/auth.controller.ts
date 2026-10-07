import type { Request, Response, NextFunction } from "express";
import { env } from "../../config/env.js";
import { sendSuccess } from "../../utils/api-response.js";
import * as authService from "./auth.service.js";

const setAuthCookie = (res: Response, token: string) => {
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/"
  });
};

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.signup(req.body);
    setAuthCookie(res, result.token);
    res.status(201).json(sendSuccess({ user: result.user }, "Account created successfully"));
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.login(req.body);
    setAuthCookie(res, result.token);
    res.json(sendSuccess({ user: result.user }, "Logged in successfully"));
  } catch (error) {
    next(error);
  }
};

export const adminLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.adminLogin(req.body);
    setAuthCookie(res, result.token);
    res.json(sendSuccess({ user: result.user }, "Admin logged in successfully"));
  } catch (error) {
    next(error);
  }
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie(env.COOKIE_NAME, { path: "/" });
  res.json(sendSuccess(null, "Logged out successfully"));
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await authService.getMe(req.user!.userId);
    res.json(sendSuccess({ user }, "Profile fetched successfully"));
  } catch (error) {
    next(error);
  }
};
