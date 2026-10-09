"use client";

import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { useStudentAuth } from "@/components/auth/student-auth-provider";
import { ResultsMarquee } from "@/components/dashboard/results-marquee";
import { heroFeatures } from "@/data/dashboard";

export function DashboardHero() {
  const { user, loading } = useStudentAuth();
  const firstName = user?.fullName.split(" ")[0] || "Student";

  return (
    <section className="dashboard-hero">
      <div className="dashboard-hero__atmosphere" aria-hidden>
        <span className="dashboard-hero__glow dashboard-hero__glow--a" />
        <span className="dashboard-hero__glow dashboard-hero__glow--b" />
        <span className="dashboard-hero__glow dashboard-hero__glow--c" />
        <span className="dashboard-hero__orb" />
      </div>

      <div className="site-container dashboard-hero__grid">
        <div className="dashboard-hero__copy">
          <p className="dashboard-hero__eyebrow">Nilsan Educare</p>
          <h1>
            <span className="dashboard-hero__title-line">
              {user ? "Welcome back," : "Welcome,"}
            </span>
            <span className="dashboard-hero__title-accent">
              {loading ? "Student" : firstName}
            </span>
          </h1>
          <p className="dashboard-hero__lead dashboard-hero__lead--full">
            {user
              ? "Continue your English learning journey with personalized 1-on-1 classes."
              : "Browse courses and free resources anytime. Log in or create an account only when you are ready to pay."}
          </p>
          <p className="dashboard-hero__lead dashboard-hero__lead--short">
            {user
              ? "Continue with personalized 1-on-1 English classes."
              : "Browse free. Log in only when you’re ready to enroll."}
          </p>

          <ul className="dashboard-hero__features">
            {heroFeatures.map((feature) => (
              <li key={feature}>
                <span className="dashboard-hero__check" aria-hidden>
                  <Check size={14} strokeWidth={3} />
                </span>
                {feature}
              </li>
            ))}
          </ul>

          <div className="dashboard-hero__actions">
            {user ? (
              <>
                <Link href="/my-learning">Go to My Learning</Link>
                <Link className="dashboard-hero__secondary" href="/dashboard#courses">
                  Browse courses
                </Link>
              </>
            ) : (
              <>
                <Link href="/signup">Sign up free</Link>
                <Link className="dashboard-hero__secondary" href="/login">
                  Log in
                </Link>
              </>
            )}
            <strong>Starting from ₹1,799</strong>
          </div>
        </div>

        <div className="dashboard-hero__visual">
          <div className="dashboard-hero__visual-glow" aria-hidden />
          <Image
            alt="Nilesh Sir, English trainer"
            className="dashboard-hero__teacher"
            height={1024}
            priority
            sizes="(max-width: 900px) 70vw, (max-width: 1180px) 380px, 520px"
            src="/images/nilesteacher.png"
            width={1536}
          />
        </div>
      </div>

      <ResultsMarquee />
    </section>
  );
}
