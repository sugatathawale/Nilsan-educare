"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ADMIN_CREDENTIALS, loginAdmin } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(ADMIN_CREDENTIALS.email);
  const [password, setPassword] = useState(ADMIN_CREDENTIALS.password);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ok = loginAdmin(email, password);

    if (!ok) {
      setError("Invalid email or password. Try the demo credentials below.");
      return;
    }

    router.replace("/admin");
  }

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={handleSubmit}>
        <BrandLogo href="/" />
        <div>
          <p className="admin-eyebrow">Admin Panel</p>
          <h1>Sign in</h1>
          <p>Use the demo login to manage students, courses, and quizzes.</p>
        </div>

        <label>
          Email
          <input
            autoComplete="username"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
        </label>

        <label>
          Password
          <input
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>

        {error ? <p className="admin-login__error">{error}</p> : null}

        <button className="admin-primary-action" type="submit">
          Login to Admin
        </button>

        <div className="admin-login__hint">
          <strong>Demo credentials</strong>
          <span>Email: {ADMIN_CREDENTIALS.email}</span>
          <span>Password: {ADMIN_CREDENTIALS.password}</span>
        </div>
      </form>
    </div>
  );
}
