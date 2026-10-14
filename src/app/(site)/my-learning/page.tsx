"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, ChevronRight, LogOut, Play } from "lucide-react";
import { useStudentAuth } from "@/components/auth/student-auth-provider";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatDate } from "@/lib/api";
import {
  fetchCoursePlayerBundle,
  fetchMyEnrollments,
  learnKeys
} from "@/lib/learn-queries";

export default function MyLearningPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, loading, logout } = useStudentAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  const enrollmentsQuery = useQuery({
    queryKey: learnKeys.enrollments,
    queryFn: fetchMyEnrollments,
    enabled: Boolean(user)
  });

  async function handleLogout() {
    await logout();
    queryClient.clear();
    router.replace("/login");
  }

  function prefetchCourse(slug: string) {
    void queryClient.prefetchQuery({
      queryKey: learnKeys.player(slug),
      queryFn: () => fetchCoursePlayerBundle(slug)
    });
  }

  if (loading || !user) {
    return (
      <div className="learn-shell">
        <LoadingSpinner label="Loading your account…" size="lg" />
      </div>
    );
  }

  const firstName = user.fullName.split(" ")[0];
  const enrollments = enrollmentsQuery.data || [];
  const showInitialLoader =
    enrollmentsQuery.isLoading && !enrollmentsQuery.data;
  const showSoftRefresh =
    enrollmentsQuery.isFetching && Boolean(enrollmentsQuery.data);

  return (
    <div className="learn-shell my-learning learn-fade-in">
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
          <div className="learn-section__head-meta">
            {showSoftRefresh ? <LoadingSpinner label="" size="sm" /> : null}
            {enrollments.length > 0 ? (
              <span className="learn-count-pill">
                {enrollments.length}{" "}
                {enrollments.length === 1 ? "course" : "courses"}
              </span>
            ) : null}
          </div>
        </div>

        {showInitialLoader ? (
          <LoadingSpinner label="Loading your courses…" size="lg" />
        ) : null}

        {enrollmentsQuery.isError ? (
          <p className="admin-state admin-state--error">
            {enrollmentsQuery.error instanceof Error
              ? enrollmentsQuery.error.message
              : "Failed to load enrollments"}
          </p>
        ) : null}

        {!showInitialLoader &&
        !enrollmentsQuery.isError &&
        enrollments.length === 0 ? (
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
                        onFocus={() => prefetchCourse(enrollment.course.slug)}
                        onMouseEnter={() =>
                          prefetchCourse(enrollment.course.slug)
                        }
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
                            onFocus={() =>
                              prefetchCourse(enrollment.course.slug)
                            }
                            onMouseEnter={() =>
                              prefetchCourse(enrollment.course.slug)
                            }
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
