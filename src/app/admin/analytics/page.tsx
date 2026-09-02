import { BarChart3, TrendingUp, UserMinus, Users } from "lucide-react";
import {
  adminStudents,
  coursePerformance,
  studentAnalytics
} from "@/data/admin";

const iconMap = {
  "Active this week": Users,
  "Quiz completions": BarChart3,
  "Avg. attendance": TrendingUp,
  "At-risk students": UserMinus
};

export default function AdminAnalyticsPage() {
  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-eyebrow">Analytics</p>
          <h1>Student Analytics</h1>
          <p>A simple view of engagement, scores, and course performance.</p>
        </div>
      </div>

      <section className="admin-metrics" aria-label="Student analytics">
        {studentAnalytics.map((metric) => {
          const Icon = iconMap[metric.label as keyof typeof iconMap] ?? Users;

          return (
            <article className="admin-metric-card" key={metric.label}>
              <div className="admin-metric-card__top">
                <span>{metric.label}</span>
                <Icon size={22} />
              </div>
              <strong>{metric.value}</strong>
              <div className="admin-metric-card__meta">
                <span>{metric.note}</span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="admin-grid">
        <article className="admin-panel admin-panel--wide">
          <div className="admin-panel__header">
            <div>
              <p className="admin-eyebrow">Courses</p>
              <h2>Course Performance</h2>
            </div>
          </div>

          <div className="admin-table admin-table--analytics" role="table">
            <div className="admin-table__head" role="row">
              <span>Course</span>
              <span>Enrollment</span>
              <span>Avg score</span>
              <span>Completion</span>
            </div>
            {coursePerformance.map((row) => (
              <div className="admin-table__row" role="row" key={row.course}>
                <span>{row.course}</span>
                <span>{row.enrollment}</span>
                <span>{row.avgScore}%</span>
                <span>
                  <div className="admin-mini-progress">
                    <i style={{ width: `${row.completion}%` }} />
                  </div>
                  {row.completion}%
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <p className="admin-eyebrow">Leaderboard</p>
              <h2>Top Students</h2>
            </div>
          </div>
          <ul className="admin-leaderboard">
            {[...adminStudents]
              .sort((a, b) => b.score - a.score)
              .slice(0, 5)
              .map((student, index) => (
                <li key={student.id}>
                  <span className="admin-leaderboard__rank">{index + 1}</span>
                  <div>
                    <strong>{student.name}</strong>
                    <span>{student.course}</span>
                  </div>
                  <b>{student.score}%</b>
                </li>
              ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
