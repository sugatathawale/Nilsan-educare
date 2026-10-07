"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PlayCircle } from "lucide-react";
import { AdminStatus } from "@/components/admin/admin-status";
import { apiRequest, formatPaise } from "@/lib/api";
import type { CourseSummary, EnrollmentRow } from "@/lib/admin-types";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [coursesData, enrollmentsData] = await Promise.all([
          apiRequest<{ courses: CourseSummary[] }>("/courses"),
          apiRequest<{ enrollments: EnrollmentRow[] }>("/enrollments")
        ]);
        if (!active) return;
        setCourses(coursesData.courses);
        setEnrollments(enrollmentsData.enrollments);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load courses");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  const enrollmentCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const enrollment of enrollments) {
      if (enrollment.status !== "PAID") continue;
      map.set(
        enrollment.course.slug,
        (map.get(enrollment.course.slug) || 0) + 1
      );
    }
    return map;
  }, [enrollments]);

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-eyebrow">Courses</p>
          <h1>Course Catalog</h1>
          <p>Active courses, pricing, lesson counts, and paid enrollments.</p>
        </div>
        <Link className="admin-primary-action" href="/admin/lessons">
          <PlayCircle size={18} />
          Manage Lessons
        </Link>
      </div>

      {loading ? <p className="admin-state">Loading courses...</p> : null}
      {error ? <p className="admin-state admin-state--error">{error}</p> : null}

      {!loading && !error && courses.length === 0 ? (
        <p className="admin-empty">No active courses yet.</p>
      ) : null}

      {!loading && !error && courses.length > 0 ? (
        <div className="admin-course-cards">
          {courses.map((course) => (
            <article className="admin-course-card" key={course.id}>
              <div className="admin-course-card__top">
                <div>
                  <strong>{course.title}</strong>
                  <span>/{course.slug}</span>
                </div>
                <AdminStatus status={course.isActive ? "Active" : "Draft"} />
              </div>

              {course.description ? (
                <p className="admin-course-card__desc">{course.description}</p>
              ) : null}

              <div className="admin-course-card__stats">
                <div>
                  <b>{formatPaise(course.pricePaise)}</b>
                  <span>Price</span>
                </div>
                <div>
                  <b>{course._count.lessons}</b>
                  <span>Lessons</span>
                </div>
                <div>
                  <b>{enrollmentCounts.get(course.slug) || 0}</b>
                  <span>Paid students</span>
                </div>
              </div>

              <Link
                className="admin-secondary-action"
                href={`/admin/lessons?course=${course.slug}`}
              >
                Manage lessons
              </Link>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
