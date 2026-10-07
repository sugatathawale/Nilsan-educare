import { apiRequest } from "@/lib/api";
import type { AppUser, StudentSignupInput } from "@/lib/auth-types";

export async function fetchStudentSession(): Promise<AppUser | null> {
  try {
    const data = await apiRequest<{ user: AppUser }>("/auth/me");
    if (data.user.role !== "STUDENT") return null;
    return data.user;
  } catch {
    return null;
  }
}

export async function signupStudent(input: StudentSignupInput): Promise<AppUser> {
  const data = await apiRequest<{ user: AppUser }>("/auth/signup", {
    method: "POST",
    body: input
  });
  return data.user;
}

export async function loginStudent(
  email: string,
  password: string
): Promise<AppUser> {
  const data = await apiRequest<{ user: AppUser }>("/auth/login", {
    method: "POST",
    body: { email, password }
  });
  return data.user;
}

export async function logoutStudent(): Promise<void> {
  try {
    await apiRequest<null>("/auth/logout", { method: "POST" });
  } catch {
    // Clear local UI even if request fails
  }
}
