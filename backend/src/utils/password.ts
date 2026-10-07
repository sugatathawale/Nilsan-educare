import bcrypt from "bcryptjs";
import { AUTH } from "../config/constants.js";

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, AUTH.BCRYPT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
