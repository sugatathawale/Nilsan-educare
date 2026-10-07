"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BadgeCheck,
  BookOpen,
  CreditCard,
  PlayCircle,
  Users
} from "lucide-react";
import { AdminStatus } from "@/components/admin/admin-status";
import { apiRequest, formatDateTime, formatPaise } from "@/lib/api";
import type { DashboardStats } from "@/lib/admin-types";

export default function AdminPage() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const result = await apiRequest<DashboardStats>("/admin/dashboard");
        if (active) setData(result);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard");
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

  if (loading) {
    return (
      <div className="admin-page">
        <p className="admin-state">Loading overview...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="admin-page">
        <p className="admin-state admin-state--error">{error || "No data"}</p>
      </div>
    );
  }

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
      detail: "Latest successful payments shown below",
      icon: CreditCard
    }
  ];

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-eyebrow">Admin Panel</p>
          <h1>Dashboard Overview</h1>
          <p>Live numbers from students, courses, enrollments, and payments.</p>
        </div>
        <Link className="admin-primary-action" href="/admin/lessons">
          <PlayCircle size={18} />
          Manage Lessons
        </Link>
      </div>

      <section className="admin-metrics" aria-label="Admin metrics">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article className="admin-metric-card" key={metric.label}>
              <div className="admin-metric-card__top">
                <span>{metric.label}</span>
                <Icon size={22} />
              </div>
              <strong>{metric.value}</strong>
              <div className="admin-metric-card__meta">
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
        <Link href="/admin/lessons">
          <PlayCircle size={20} />
          Lessons
        </Link>
        <Link href="/admin/payments">
          <CreditCard size={20} />
          Payments
        </Link>
        <Link href="/admin/enrollments">
          <BadgeCheck size={20} />
          Enrollments
        </Link>
      </section>

      <section className="admin-grid">
        <article className="admin-panel admin-panel--full">
          <div className="admin-panel__header">
            <div>
              <p className="admin-eyebrow">Commerce</p>
              <h2>Recent Payments</h2>
            </div>
            <Link className="admin-secondary-action" href="/admin/payments">
              View All
            </Link>
          </div>

          {data.recentPayments.length === 0 ? (
            <p className="admin-empty">No paid transactions yet.</p>
          ) : (
            <div className="admin-table admin-table--payments" role="table">
              <div className="admin-table__head" role="row">
                <span>Student</span>
                <span>Course</span>
                <span>Amount</span>
                <span>Date</span>
                <span>Status</span>
              </div>
              {data.recentPayments.map((payment) => (
                <div className="admin-table__row" role="row" key={payment.id}>
                  <span>
                    <strong>{payment.user.fullName}</strong>
                    <small>{payment.user.email}</small>
                  </span>
                  <span>{payment.course.title}</span>
                  <span>{formatPaise(payment.amountPaise)}</span>
                  <span>{formatDateTime(payment.createdAt)}</span>
                  <span>
                    <AdminStatus status={payment.status} />
                  </span>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
