"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { adminCourses } from "@/data/admin";

export default function AdminCoursesPage() {
  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-eyebrow">Courses</p>
          <h1>Course Management</h1>
          <p>See all courses and add quizzes to any course.</p>
        </div>
        <Link className="admin-primary-action" href="/admin/quizzes">
          <Plus size={18} />
          Add Quiz
        </Link>
      </div>

      <div className="admin-course-cards">
        {adminCourses.map((course) => (
          <article className="admin-course-card" key={course.id}>
            <div className="admin-course-card__top">
              <div>
                <strong>{course.title}</strong>
                <span>Trainer: {course.trainer}</span>
              </div>
              <span className={`admin-status admin-status--${course.status.toLowerCase()}`}>
                {course.status}
              </span>
            </div>

            <div className="admin-course-card__stats">
              <div>
                <b>{course.students}</b>
                <span>Students</span>
              </div>
              <div>
                <b>{course.quizzes}</b>
                <span>Quizzes</span>
              </div>
              <div>
                <b>{course.completion}%</b>
                <span>Completion</span>
              </div>
            </div>

            <div className="admin-course-row__progress">
              <div>
                <i style={{ width: `${course.completion}%` }} />
              </div>
            </div>

            <Link
              className="admin-secondary-action"
              href={`/admin/quizzes?course=${course.id}`}
            >
              Add quiz to this course
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
