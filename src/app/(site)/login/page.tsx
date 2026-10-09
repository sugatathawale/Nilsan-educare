"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/ui/brand-logo";
import { useStudentAuth } from "@/components/auth/student-auth-provider";
import { ApiRequestError } from "@/lib/api";
import { resolveAuthNext } from "@/lib/checkout-auth";

function StudentLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, login } = useStudentAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const nextPath = useMemo(
    () => resolveAuthNext(searchParams),
    [searchParams]
  );
  const signupHref = `/signup?next=${encodeURIComponent(nextPath)}`;
  const checkoutHint = nextPath.includes("checkout=");

  useEffect(() => {
    if (!loading && user) {
      router.replace(nextPath);
    }
  }, [loading, user, router, nextPath]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      router.replace(nextPath);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Unable to sign in. Is the API running?"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="auth-page">
        <p className="admin-state">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <BrandLogo href="/dashboard" />
        <div>
          <p className="admin-eyebrow">Student Portal</p>
          <h1>Welcome back</h1>
          <p>
            {checkoutHint
              ? "Log in to continue your payment securely."
              : "Log in to access your enrolled courses and lessons."}
          </p>
        </div>

        <label>
          Email
          <input
            autoComplete="email"
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

        {error ? <p className="auth-error">{error}</p> : null}

        <button className="admin-primary-action" disabled={submitting} type="submit">
          {submitting ? "Signing in..." : checkoutHint ? "Log in & continue" : "Log in"}
        </button>

        <p className="auth-switch">
          New student? <Link href={signupHref}>Create an account</Link>
        </p>
      </form>
    </div>
  );
}

export default function StudentLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-page">
          <p className="admin-state">Loading...</p>
        </div>
      }
    >
      <StudentLoginForm />
    </Suspense>
  );
}
