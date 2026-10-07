import { z } from "zod";
import { AUTH } from "../../config/constants.js";

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(2, "Name must be at least 2 characters"),
    institution: z.string().trim().min(2, "College or school is required"),
    academicYear: z.string().trim().min(1, "Year is required"),
    classGrade: z.string().trim().min(1, "Class is required"),
    email: z.string().trim().email("Invalid email address"),
    password: z
      .string()
      .min(AUTH.MIN_PASSWORD_LENGTH, `Password must be at least ${AUTH.MIN_PASSWORD_LENGTH} characters`),
    confirmPassword: z.string(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    country: z.string().trim().default("India"),
    latitude: z.number().optional(),
    longitude: z.number().optional()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

export const adminLoginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
