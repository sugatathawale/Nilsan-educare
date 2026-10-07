import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import { signToken } from "../../lib/jwt.js";
import { AppError } from "../../middleware/error.middleware.js";
import { comparePassword, hashPassword } from "../../utils/password.js";
import { toSafeUser } from "../../utils/user-mapper.js";
import type { AdminLoginInput, LoginInput, SignupInput } from "./auth.validator.js";

export const signup = async (input: SignupInput) => {
  const existing = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() }
  });

  if (existing) {
    throw new AppError("Email is already registered", 409);
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      fullName: input.fullName,
      email: input.email.toLowerCase(),
      passwordHash,
      institution: input.institution,
      academicYear: input.academicYear,
      classGrade: input.classGrade,
      city: input.city,
      state: input.state,
      country: input.country,
      latitude: input.latitude,
      longitude: input.longitude,
      role: "STUDENT"
    }
  });

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  return { user: toSafeUser(user), token };
};

export const login = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() }
  });

  if (!user || user.role !== "STUDENT") {
    throw new AppError("Invalid email or password", 401);
  }

  const valid = await comparePassword(input.password, user.passwordHash);

  if (!valid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  return { user: toSafeUser(user), token };
};

export const adminLogin = async (input: AdminLoginInput) => {
  const isValidAdmin =
    input.email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase() &&
    input.password === env.ADMIN_PASSWORD;

  if (!isValidAdmin) {
    throw new AppError("Invalid admin credentials", 401);
  }

  let admin = await prisma.user.findUnique({
    where: { email: env.ADMIN_EMAIL.toLowerCase() }
  });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        fullName: "Admin",
        email: env.ADMIN_EMAIL.toLowerCase(),
        passwordHash: await hashPassword(env.ADMIN_PASSWORD),
        institution: "Nilsan Educare",
        academicYear: "N/A",
        classGrade: "N/A",
        role: "ADMIN"
      }
    });
  }

  const token = signToken({
    userId: admin.id,
    email: admin.email,
    role: "ADMIN"
  });

  return {
    user: toSafeUser(admin),
    token
  };
};

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return toSafeUser(user);
};
