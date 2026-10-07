import { apiRequest } from "@/lib/api";
import type { AdminUser } from "@/lib/admin-types";

export async function fetchAdminSession(): Promise<AdminUser | null> {
  try {
    const data = await apiRequest<{ user: AdminUser }>("/auth/me");
    if (data.user.role !== "ADMIN") return null;
    return data.user;
  } catch {
    return null;
  }
}

export async function loginAdmin(
  email: string,
  password: string
): Promise<AdminUser> {
  const data = await apiRequest<{ user: AdminUser }>("/auth/admin/login", {
    method: "POST",
    body: { email, password }
  });
  return data.user;
}

export async function logoutAdmin(): Promise<void> {
  try {
    await apiRequest<null>("/auth/logout", { method: "POST" });
  } catch {
    // Clear local UI state even if the request fails
  }
}
