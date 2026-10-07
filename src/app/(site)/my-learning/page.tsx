"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, LogOut } from "lucide-react";
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
      <div className="admin-page">
        <p className="admin-state">Loading your account...</p>
      </div>
    );
  }

  return (
    <div className="admin-page my-learning">
      <div className="admin-page__heading">
        <div>
          <p className="admin-eyebrow">My Learning</p>
          <h1>Hi, {user.fullName.split(" ")[0]}</h1>
          <p>
            {user.institution} · {user.academicYear} · {user.classGrade}
          </p>
        </div>
        <div className="my-learning__actions">
          <Link className="admin-secondary-action" href="/dashboard#courses">
            Browse courses
          </Link>
          <button className="admin-danger-action" onClick={handleLogout} type="button">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <p className="admin-eyebrow">Enrolled</p>
            <h2>Your courses</h2>
          </div>
        </div>

        {fetching ? <p className="admin-state">Loading courses...</p> : null}
        {error ? <p className="admin-state admin-state--error">{error}</p> : null}

        {!fetching && !error && enrollments.length === 0 ? (
          <div className="admin-empty my-learning__empty">
            <BookOpen size={28} />
            <p>You have no paid enrollments yet.</p>
            <Link className="admin-primary-action" href="/courses/speak-english-learn-english">
              Explore Speak English course
            </Link>
          </div>
        ) : null}

        {enrollments.length > 0 ? (
          <div className="my-learning__grid">
            {enrollments.map((enrollment) => (
              <article className="admin-course-card" key={enrollment.id}>
                <div className="admin-course-card__top">
                  <div>
                    <strong>{enrollment.course.title}</strong>
                    <span>Enrolled {formatDate(enrollment.createdAt)}</span>
                  </div>
                </div>

                <div className="admin-course-card__stats">
                  <div>
                    <b>{enrollment.course.lessons.length}</b>
                    <span>Lessons</span>
                  </div>
                  <div>
                    <b>{enrollment.status}</b>
                    <span>Status</span>
                  </div>
                </div>

                <ul className="my-learning__lessons">
                  {enrollment.course.lessons.slice(0, 4).map((lesson) => (
                    <li key={lesson.id}>
                      <span>
                        {lesson.order}. {lesson.title}
                      </span>
                      <small>{lesson.duration || "—"}</small>
                    </li>
                  ))}
                </ul>

                <Link
                  className="admin-secondary-action"
                  href={`/courses/${enrollment.course.slug}`}
                >
                  Open course
                </Link>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
