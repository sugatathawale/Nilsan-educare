"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/ui/brand-logo";
import { loginAdmin } from "@/lib/admin-auth";
import { ApiRequestError } from "@/lib/api";

const DEMO_CREDENTIALS = {
  email: "admin@nilsaneducare.com",
  password: "admin123"
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginAdmin(email, password);
      router.replace("/admin");
    } catch (err) {
      const message =
        err instanceof ApiRequestError
          ? err.message
          : "Unable to sign in. Check the API is running.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={handleSubmit}>
        <BrandLogo href="/" />
        <div>
          <p className="admin-eyebrow">Admin Panel</p>
          <h1>Sign in</h1>
          <p>Manage students, courses, lessons, payments, and enrollments.</p>
        </div>

        <label>
          Email
          <input
            autoComplete="username"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>

        <label>
          Password
          <input
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>

        {error ? <p className="admin-login__error">{error}</p> : null}

        <button className="admin-primary-action" disabled={loading} type="submit">
          {loading ? "Signing in..." : "Login to Admin"}
        </button>

        <div className="admin-login__hint">
          <strong>Demo credentials</strong>
          <span>Email: {DEMO_CREDENTIALS.email}</span>
          <span>Password: {DEMO_CREDENTIALS.password}</span>
        </div>
      </form>
    </div>
  );
}
