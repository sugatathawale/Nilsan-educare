import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  Plus,
  Users
} from "lucide-react";
import {
  adminCourses,
  adminMetrics,
  adminTasks,
  recentEnrollments
} from "@/data/admin";

const iconMap = {
  Users,
  BookOpen,
  ClipboardList,
  BarChart3
};

export default function AdminPage() {
  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-eyebrow">Admin Panel</p>
          <h1>Dashboard Overview</h1>
          <p>Manage students, courses, quizzes, and analytics in one place.</p>
        </div>
        <Link className="admin-primary-action" href="/admin/quizzes">
          <Plus size={18} />
          Create Quiz
        </Link>
      </div>

      <section className="admin-metrics" aria-label="Admin metrics">
        {adminMetrics.map((metric) => {
          const Icon = iconMap[metric.icon as keyof typeof iconMap];

          return (
            <article className="admin-metric-card" key={metric.label}>
              <div className="admin-metric-card__top">
                <span>{metric.label}</span>
                <Icon size={22} />
              </div>
              <strong>{metric.value}</strong>
              <div className="admin-metric-card__meta">
                <b>{metric.delta}</b>
                <span>{metric.detail}</span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="admin-quick-links" aria-label="Quick links">
        <Link href="/admin/students">
          <Users size={20} />
          Students
        </Link>
        <Link href="/admin/courses">
          <BookOpen size={20} />
          Courses
        </Link>
        <Link href="/admin/quizzes">
          <ClipboardList size={20} />
          Quizzes
        </Link>
        <Link href="/admin/analytics">
          <BarChart3 size={20} />
          Analytics
        </Link>
      </section>

      <section className="admin-grid">
        <article className="admin-panel admin-panel--wide">
          <div className="admin-panel__header">
            <div>
              <p className="admin-eyebrow">Courses</p>
              <h2>Course Management</h2>
            </div>
            <Link className="admin-secondary-action" href="/admin/courses">
              View All
            </Link>
          </div>

          <div className="admin-course-list">
            {adminCourses.map((course) => (
              <div className="admin-course-row" key={course.title}>
                <div>
                  <strong>{course.title}</strong>
                  <span>
                    {course.students} students • {course.quizzes} quizzes • Trainer:{" "}
                    {course.trainer}
                  </span>
                </div>
                <div className="admin-course-row__progress">
                  <span>{course.completion}%</span>
                  <div>
                    <i style={{ width: `${course.completion}%` }} />
                  </div>
                </div>
                <span className={`admin-status admin-status--${course.status.toLowerCase()}`}>
                  {course.status}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <p className="admin-eyebrow">Operations</p>
              <h2>Today&apos;s Tasks</h2>
            </div>
          </div>
          <ul className="admin-task-list">
            {adminTasks.map((task) => (
              <li key={task}>{task}</li>
            ))}
          </ul>
        </article>

        <article className="admin-panel admin-panel--wide">
          <div className="admin-panel__header">
            <div>
              <p className="admin-eyebrow">Enrollments</p>
              <h2>Recent Payments</h2>
            </div>
          </div>

          <div className="admin-table" role="table" aria-label="Recent enrollments">
            <div className="admin-table__head" role="row">
              <span>Student</span>
              <span>Course</span>
              <span>Amount</span>
              <span>Status</span>
            </div>
            {recentEnrollments.map((row) => (
              <div className="admin-table__row" role="row" key={`${row.student}-${row.course}`}>
                <span>{row.student}</span>
                <span>{row.course}</span>
                <span>{row.amount}</span>
                <span className={`admin-status admin-status--${row.status.toLowerCase()}`}>
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
