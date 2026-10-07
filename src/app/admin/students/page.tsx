"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AdminStatus } from "@/components/admin/admin-status";
import { apiRequest, formatDate } from "@/lib/api";
import type { AdminStudent } from "@/lib/admin-types";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await apiRequest<{ students: AdminStudent[] }>("/users");
        if (active) setStudents(data.students);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load students");
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
    if (!q) return students;
    return students.filter((student) => {
      const courses = student.enrollments
        .map((item) => item.course.title)
        .join(" ")
        .toLowerCase();
      return (
        student.fullName.toLowerCase().includes(q) ||
        student.email.toLowerCase().includes(q) ||
        student.institution.toLowerCase().includes(q) ||
        courses.includes(q)
      );
    });
  }, [query, students]);

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-eyebrow">Students</p>
          <h1>All Students</h1>
          <p>Registered learners, institutions, and enrolled courses.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <label className="admin-search">
          <Search size={18} />
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email, institution, or course"
            type="search"
            value={query}
          />
        </label>
        <span className="admin-toolbar__count">{filtered.length} students</span>
      </div>

      {loading ? <p className="admin-state">Loading students...</p> : null}
      {error ? <p className="admin-state admin-state--error">{error}</p> : null}

      {!loading && !error && filtered.length === 0 ? (
        <p className="admin-empty">No students found.</p>
      ) : null}

      {!loading && !error && filtered.length > 0 ? (
        <div className="admin-table admin-table--students" role="table">
          <div className="admin-table__head" role="row">
            <span>Student</span>
            <span>Institution</span>
            <span>Location</span>
            <span>Enrollments</span>
            <span>Joined</span>
          </div>
          {filtered.map((student) => {
            const paid = student.enrollments.filter((item) => item.status === "PAID");
            const location = [student.city, student.state].filter(Boolean).join(", ") || "—";

            return (
              <div className="admin-table__row" role="row" key={student.id}>
                <span>
                  <strong>{student.fullName}</strong>
                  <small>{student.email}</small>
                </span>
                <span>
                  <strong>{student.institution}</strong>
                  <small>
                    {student.academicYear} · {student.classGrade}
                  </small>
                </span>
                <span>{location}</span>
                <span>
                  {paid.length === 0 ? (
                    <small>No paid courses</small>
                  ) : (
                    paid.map((item) => (
                      <span className="admin-chip-row" key={item.id}>
                        <AdminStatus status={item.status} />
                        <small>{item.course.title}</small>
                      </span>
                    ))
                  )}
                </span>
                <span>{formatDate(student.createdAt)}</span>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
