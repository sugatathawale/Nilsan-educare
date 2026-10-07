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
      <div className="site-container dashboard-hero__grid">
        <div className="dashboard-hero__copy">
          <h1>
            <span className="dashboard-hero__title-line">
              {user ? "Welcome back," : "Welcome,"}
            </span>
            <span className="dashboard-hero__title-accent">
              {loading ? "..." : `${firstName}!`}
            </span>
          </h1>
          <p>
            {user
              ? "Continue your English learning journey with personalized 1-on-1 classes."
              : "Create an account to enroll in courses and start speaking with confidence."}
          </p>

          <ul>
            {heroFeatures.map((feature) => (
              <li key={feature}>
                <Check size={34} />
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
          <Image
            alt="Teacher"
            className="dashboard-hero__teacher"
            height={1024}
            priority
            sizes="(max-width: 900px) 90vw, 520px"
            src="/images/nilesteacher.png"
            width={1536}
          />
        </div>
      </div>

      <ResultsMarquee />
    </section>
  );
}
