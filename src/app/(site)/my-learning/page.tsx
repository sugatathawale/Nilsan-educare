"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronRight, LogOut, Play } from "lucide-react";
import { useStudentAuth } from "@/components/auth/student-auth-provider";
import { apiRequest, formatDate } from "@/lib/api";
import type { MyEnrollment } from "@/lib/auth-types";

export default function MyLearningPage() {
  const router = useRouter();
  const { user, loading, logout } = useStudentAuth();
  const [enrollments, setEnrollments] = useState<MyEnrollment[]>([]);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;

    let active = true;

    async function load() {
      try {
        const data = await apiRequest<{ enrollments: MyEnrollment[] }>(
          "/enrollments/my"
        );
        if (active) setEnrollments(data.enrollments);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Failed to load enrollments"
          );
        }
      } finally {
        if (active) setFetching(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [user]);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  if (loading || !user) {
    return (
      <div className="learn-shell">
        <p className="admin-state">Loading your account...</p>
      </div>
    );
  }

  const firstName = user.fullName.split(" ")[0];

  return (
    <div className="learn-shell my-learning">
      <header className="learn-hero">
        <div className="learn-hero__copy">
          <p className="learn-kicker">My Learning</p>
          <h1>Hi, {firstName}</h1>
          <p className="learn-hero__meta">
            {user.institution} · {user.academicYear} · {user.classGrade}
          </p>
        </div>
        <div className="learn-hero__actions">
          <Link className="learn-btn learn-btn--ghost" href="/dashboard#courses">
            Browse courses
          </Link>
          <button
            className="learn-btn learn-btn--quiet"
            onClick={handleLogout}
            type="button"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <section className="learn-section">
        <div className="learn-section__head">
          <div>
            <p className="learn-kicker">Enrolled</p>
            <h2>Your courses</h2>
          </div>
          {enrollments.length > 0 ? (
            <span className="learn-count-pill">
              {enrollments.length}{" "}
              {enrollments.length === 1 ? "course" : "courses"}
            </span>
          ) : null}
        </div>

        {fetching ? <p className="admin-state">Loading courses...</p> : null}
        {error ? <p className="admin-state admin-state--error">{error}</p> : null}

        {!fetching && !error && enrollments.length === 0 ? (
          <div className="learn-empty">
            <BookOpen size={32} />
            <h3>No courses yet</h3>
            <p>Enroll in a program to unlock lectures and notes here.</p>
            <Link
              className="learn-btn learn-btn--primary"
              href="/courses/speak-english-learn-english"
            >
              Explore Speak English course
            </Link>
          </div>
        ) : null}

        {enrollments.length > 0 ? (
          <div className="my-learning__grid">
            {enrollments.map((enrollment) => {
              const lessons = enrollment.course.lessons;
              const preview = lessons.slice(0, 5);
              const remaining = Math.max(0, lessons.length - preview.length);
              const continueHref = `/my-learning/${enrollment.course.slug}`;

              return (
                <article className="learn-course-card" key={enrollment.id}>
                  <div className="learn-course-card__accent" aria-hidden />
                  <div className="learn-course-card__body">
                    <div className="learn-course-card__top">
                      <div>
                        <div className="learn-course-card__badges">
                          <span className="learn-badge learn-badge--paid">
                            {enrollment.status}
                          </span>
                          <span className="learn-badge">
                            {lessons.length} lessons
                          </span>
                        </div>
                        <h3>{enrollment.course.title}</h3>
                        <p>Enrolled {formatDate(enrollment.createdAt)}</p>
                      </div>
                      <Link
                        className="learn-btn learn-btn--primary learn-btn--icon"
                        href={continueHref}
                      >
                        <Play size={16} fill="currentColor" />
                        Watch lectures
                      </Link>
                    </div>

                    <ul className="learn-lesson-preview">
                      {preview.map((lesson) => (
                        <li key={lesson.id}>
                          <Link
                            href={`/my-learning/${enrollment.course.slug}?lesson=${lesson.id}`}
                          >
                            <span className="learn-lesson-preview__index">
                              {lesson.order}
                            </span>
                            <span className="learn-lesson-preview__title">
                              {lesson.title}
                            </span>
                            <small>{lesson.duration || "—"}</small>
                            <ChevronRight size={16} aria-hidden />
                          </Link>
                        </li>
                      ))}
                    </ul>

                    {remaining > 0 ? (
                      <p className="learn-lesson-preview__more">
                        +{remaining} more lesson{remaining === 1 ? "" : "s"}
                      </p>
                    ) : null}

                    <div className="my-learning__card-actions">
                      <Link
                        className="learn-btn learn-btn--ghost"
                        href={`/courses/${enrollment.course.slug}`}
                      >
                        Course details
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </section>
    </div>
  );
}
