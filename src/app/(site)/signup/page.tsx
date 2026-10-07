"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/ui/brand-logo";
import { useStudentAuth } from "@/components/auth/student-auth-provider";
import { ApiRequestError } from "@/lib/api";

const ACADEMIC_YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Graduate",
  "Working Professional",
  "Other"
];

export default function StudentSignupPage() {
  const router = useRouter();
  const { user, loading, signup } = useStudentAuth();
  const [fullName, setFullName] = useState("");
  const [institution, setInstitution] = useState("");
  const [academicYear, setAcademicYear] = useState(ACADEMIC_YEARS[0]);
  const [classGrade, setClassGrade] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/my-learning");
    }
  }, [loading, user, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);

    try {
      await signup({
        fullName: fullName.trim(),
        institution: institution.trim(),
        academicYear,
        classGrade: classGrade.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        country: "India"
      });
      router.replace("/my-learning");
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Unable to create account. Is the API running?"
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
      <form className="auth-card auth-card--wide" onSubmit={handleSubmit}>
        <BrandLogo href="/dashboard" />
        <div>
          <p className="admin-eyebrow">Student Portal</p>
          <h1>Create account</h1>
          <p>Sign up to enroll in courses and track your learning.</p>
        </div>

        <div className="auth-grid">
          <label>
            Full name
            <input
              autoComplete="name"
              onChange={(event) => setFullName(event.target.value)}
              required
              type="text"
              value={fullName}
            />
          </label>
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
        </div>

        <div className="auth-grid">
          <label>
            College / School
            <input
              onChange={(event) => setInstitution(event.target.value)}
              placeholder="e.g. Pune University"
              required
              type="text"
              value={institution}
            />
          </label>
          <label>
            Class / Course
            <input
              onChange={(event) => setClassGrade(event.target.value)}
              placeholder="e.g. B.Tech, Class 12"
              required
              type="text"
              value={classGrade}
            />
          </label>
        </div>

        <label>
          Academic year / Stage
          <select
            onChange={(event) => setAcademicYear(event.target.value)}
            value={academicYear}
          >
            {ACADEMIC_YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <div className="auth-grid">
          <label>
            City (optional)
            <input
              onChange={(event) => setCity(event.target.value)}
              type="text"
              value={city}
            />
          </label>
          <label>
            State (optional)
            <input
              onChange={(event) => setState(event.target.value)}
              type="text"
              value={state}
            />
          </label>
        </div>

        <div className="auth-grid">
          <label>
            Password
            <input
              autoComplete="new-password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          <label>
            Confirm password
            <input
              autoComplete="new-password"
              minLength={8}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              type="password"
              value={confirmPassword}
            />
          </label>
        </div>

        {error ? <p className="auth-error">{error}</p> : null}

        <button className="admin-primary-action" disabled={submitting} type="submit">
          {submitting ? "Creating account..." : "Sign up"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
