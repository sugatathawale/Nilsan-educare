"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AdminStatus } from "@/components/admin/admin-status";
import { apiRequest, formatDateTime, formatPaise } from "@/lib/api";
import type { PaymentRow, PaymentStatus } from "@/lib/admin-types";

const STATUS_FILTERS: Array<"ALL" | PaymentStatus> = [
  "ALL",
  "PAID",
  "CREATED",
  "FAILED"
];

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | PaymentStatus>("ALL");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await apiRequest<{ payments: PaymentRow[] }>("/payments");
        if (active) setPayments(data.payments);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load payments");
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
    return payments.filter((payment) => {
      if (status !== "ALL" && payment.status !== status) return false;
      if (!q) return true;
      return (
        payment.user.fullName.toLowerCase().includes(q) ||
        payment.user.email.toLowerCase().includes(q) ||
        payment.course.title.toLowerCase().includes(q) ||
        payment.razorpayOrderId.toLowerCase().includes(q)
      );
    });
  }, [payments, query, status]);

  const paidTotal = useMemo(
    () =>
      payments
        .filter((payment) => payment.status === "PAID")
        .reduce((sum, payment) => sum + payment.amountPaise, 0),
    [payments]
  );

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-eyebrow">Payments</p>
          <h1>Payment History</h1>
          <p>Razorpay orders, statuses, and successful collections.</p>
        </div>
        <div className="admin-stat-pill">
          <span>Paid total</span>
          <strong>{formatPaise(paidTotal)}</strong>
        </div>
      </div>

      <div className="admin-toolbar admin-toolbar--filters">
        <label className="admin-search">
          <Search size={18} />
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search student, course, or order id"
            type="search"
            value={query}
          />
        </label>
        <div className="admin-filter-group">
          {STATUS_FILTERS.map((item) => (
            <button
              className={
                status === item
                  ? "admin-filter is-active"
                  : "admin-filter"
              }
              key={item}
              onClick={() => setStatus(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
        <span className="admin-toolbar__count">{filtered.length} payments</span>
      </div>

      {loading ? <p className="admin-state">Loading payments...</p> : null}
      {error ? <p className="admin-state admin-state--error">{error}</p> : null}

      {!loading && !error && filtered.length === 0 ? (
        <p className="admin-empty">No payments match your filters.</p>
      ) : null}

      {!loading && !error && filtered.length > 0 ? (
        <div className="admin-table admin-table--payments-full" role="table">
          <div className="admin-table__head" role="row">
            <span>Student</span>
            <span>Course</span>
            <span>Amount</span>
            <span>Order</span>
            <span>Date</span>
            <span>Status</span>
          </div>
          {filtered.map((payment) => (
            <div className="admin-table__row" role="row" key={payment.id}>
              <span>
                <strong>{payment.user.fullName}</strong>
                <small>{payment.user.email}</small>
              </span>
              <span>{payment.course.title}</span>
              <span>{formatPaise(payment.amountPaise)}</span>
              <span>
                <small>{payment.razorpayOrderId}</small>
              </span>
              <span>{formatDateTime(payment.createdAt)}</span>
              <span>
                <AdminStatus status={payment.status} />
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
