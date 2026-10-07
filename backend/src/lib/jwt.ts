import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type JwtPayload = {
  userId: string;
  email: string;
  role: "STUDENT" | "ADMIN";
};

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};
