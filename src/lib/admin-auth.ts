const AUTH_KEY = "nilsan_admin_auth";

export const ADMIN_CREDENTIALS = {
  email: "admin@nilsaneducare.com",
  password: "admin123"
};

export function isAdminLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(AUTH_KEY) === "1";
}

export function loginAdmin(email: string, password: string): boolean {
  const ok =
    email.trim().toLowerCase() === ADMIN_CREDENTIALS.email &&
    password === ADMIN_CREDENTIALS.password;

  if (ok) {
    window.localStorage.setItem(AUTH_KEY, "1");
  }

  return ok;
}

export function logoutAdmin() {
  window.localStorage.removeItem(AUTH_KEY);
}
