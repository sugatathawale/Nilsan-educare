"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  BookOpen,
  CreditCard,
  PlayCircle,
  Users
} from "lucide-react";
import { AdminStatus } from "@/components/admin/admin-status";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatDateTime, formatPaise } from "@/lib/api";
import { adminKeys, fetchAdminDashboard } from "@/lib/admin-queries";

export default function AdminPage() {
  const dashboardQuery = useQuery({
    queryKey: adminKeys.dashboard,
    queryFn: fetchAdminDashboard
  });

  if (dashboardQuery.isLoading && !dashboardQuery.data) {
    return (
      <div className="admin-page">
        <LoadingSpinner label="Loading overview…" size="lg" />
      </div>
    );
  }

  if (dashboardQuery.error || !dashboardQuery.data) {
    return (
      <div className="admin-page">
        <p className="admin-state admin-state--error">
          {dashboardQuery.error instanceof Error
            ? dashboardQuery.error.message
            : "No data"}
        </p>
      </div>
    );
  }

  const data = dashboardQuery.data;

  const metrics = [
    {
      label: "Total Students",
      value: String(data.stats.studentCount),
      detail: "Registered student accounts",
      icon: Users
    },
    {
      label: "Active Courses",
      value: String(data.stats.courseCount),
      detail: "Published in the catalog",
      icon: BookOpen
    },
    {
      label: "Paid Enrollments",
      value: String(data.stats.paidEnrollments),
      detail: "Students with course access",
      icon: BadgeCheck
    },
    {
      label: "Recent Payments",
      value: String(data.recentPayments.length),
      detail: "Latest payment activity",
      icon: CreditCard
    }
  ];

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-eyebrow">Overview</p>
          <h1>Admin Dashboard</h1>
          <p>Snapshot of students, courses, enrollments, and payments.</p>
        </div>
        <Link className="admin-primary-action" href="/admin/courses">
          <PlayCircle size={18} />
          Manage courses
        </Link>
      </div>

      <div className="admin-metrics">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article className="admin-metric-card" key={metric.label}>
              <div className="admin-metric-card__top">
                <span>{metric.label}</span>
                <Icon size={20} />
              </div>
              <strong>{metric.value}</strong>
              <div className="admin-metric-card__meta">
                <span>{metric.detail}</span>
              </div>
            </article>
          );
        })}
      </div>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <p className="admin-eyebrow">Payments</p>
            <h2>Recent activity</h2>
          </div>
          <Link className="admin-secondary-action" href="/admin/payments">
            View all
          </Link>
        </div>

        {data.recentPayments.length === 0 ? (
          <p className="admin-empty">No payments yet.</p>
        ) : (
          <div className="admin-table admin-table--payments" role="table">
            <div className="admin-table__head" role="row">
              <span>Student</span>
              <span>Course</span>
              <span>Amount</span>
              <span>Status</span>
              <span>When</span>
            </div>
            {data.recentPayments.map((payment) => (
              <div className="admin-table__row" role="row" key={payment.id}>
                <span>
                  <strong>{payment.user.fullName}</strong>
                  <small>{payment.user.email}</small>
                </span>
                <span>{payment.course.title}</span>
                <span>{formatPaise(payment.amountPaise)}</span>
                <span>
                  <AdminStatus status={payment.status} />
                </span>
                <span>{formatDateTime(payment.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
