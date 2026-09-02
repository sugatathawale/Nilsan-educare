"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { adminStudents } from "@/data/admin";

export default function AdminStudentsPage() {
  const [query, setQuery] = useState("");

  const students = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return adminStudents;
    return adminStudents.filter(
      (student) =>
        student.name.toLowerCase().includes(q) ||
        student.email.toLowerCase().includes(q) ||
        student.course.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-eyebrow">Students</p>
          <h1>All Students</h1>
          <p>View enrolled students, progress, and quiz scores.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <label className="admin-search">
          <Search size={18} />
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email, or course"
            type="search"
            value={query}
          />
        </label>
        <span className="admin-toolbar__count">{students.length} students</span>
      </div>

      <div className="admin-table admin-table--students" role="table" aria-label="Students">
        <div className="admin-table__head" role="row">
          <span>Student</span>
          <span>Course</span>
          <span>Progress</span>
          <span>Quiz score</span>
          <span>Last active</span>
        </div>
        {students.map((student) => (
          <div className="admin-table__row" role="row" key={student.id}>
            <span>
              <strong>{student.name}</strong>
              <small>{student.email}</small>
            </span>
            <span>{student.course}</span>
            <span>
              <div className="admin-mini-progress">
                <i style={{ width: `${student.progress}%` }} />
              </div>
              {student.progress}%
            </span>
            <span>{student.score}%</span>
            <span>{student.lastActive}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
