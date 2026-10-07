"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AdminStatus } from "@/components/admin/admin-status";
import { apiRequest, formatDateTime } from "@/lib/api";
import type { EnrollmentRow, EnrollmentStatus } from "@/lib/admin-types";

const STATUS_FILTERS: Array<"ALL" | EnrollmentStatus> = [
  "ALL",
  "PAID",
  "PENDING",
  "EXPIRED",
  "CANCELLED"
];

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | EnrollmentStatus>("ALL");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await apiRequest<{ enrollments: EnrollmentRow[] }>(
          "/enrollments"
        );
        if (active) setEnrollments(data.enrollments);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Failed to load enrollments"
          );
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enrollments.filter((enrollment) => {
      if (status !== "ALL" && enrollment.status !== status) return false;
      if (!q) return true;
      return (
        enrollment.user.fullName.toLowerCase().includes(q) ||
        enrollment.user.email.toLowerCase().includes(q) ||
        enrollment.course.title.toLowerCase().includes(q)
      );
    });
  }, [enrollments, query, status]);

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-eyebrow">Enrollments</p>
          <h1>Course Enrollments</h1>
          <p>Track who has access, pending payments, and cancelled seats.</p>
        </div>
      </div>

      <div className="admin-toolbar admin-toolbar--filters">
        <label className="admin-search">
          <Search size={18} />
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search student or course"
            type="search"
            value={query}
          />
        </label>
        <div className="admin-filter-group">
          {STATUS_FILTERS.map((item) => (
            <button
              className={
                status === item ? "admin-filter is-active" : "admin-filter"
              }
              key={item}
              onClick={() => setStatus(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
        <span className="admin-toolbar__count">
          {filtered.length} enrollments
        </span>
      </div>

      {loading ? <p className="admin-state">Loading enrollments...</p> : null}
      {error ? <p className="admin-state admin-state--error">{error}</p> : null}

      {!loading && !error && filtered.length === 0 ? (
        <p className="admin-empty">No enrollments match your filters.</p>
      ) : null}

      {!loading && !error && filtered.length > 0 ? (
        <div className="admin-table admin-table--enrollments" role="table">
          <div className="admin-table__head" role="row">
            <span>Student</span>
            <span>Course</span>
            <span>Status</span>
            <span>Created</span>
          </div>
          {filtered.map((enrollment) => (
            <div className="admin-table__row" role="row" key={enrollment.id}>
              <span>
                <strong>{enrollment.user.fullName}</strong>
                <small>{enrollment.user.email}</small>
              </span>
              <span>
                <strong>{enrollment.course.title}</strong>
                <small>/{enrollment.course.slug}</small>
              </span>
              <span>
                <AdminStatus status={enrollment.status} />
              </span>
              <span>{formatDateTime(enrollment.createdAt)}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
