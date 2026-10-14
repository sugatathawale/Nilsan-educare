"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { AdminStatus } from "@/components/admin/admin-status";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatDateTime, formatPaise } from "@/lib/api";
import { adminKeys, fetchAdminPayments } from "@/lib/admin-queries";
import type { PaymentStatus } from "@/lib/admin-types";

const STATUS_FILTERS: Array<"ALL" | PaymentStatus> = [
  "ALL",
  "PAID",
  "CREATED",
  "FAILED"
];

export default function AdminPaymentsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | PaymentStatus>("ALL");

  const paymentsQuery = useQuery({
    queryKey: adminKeys.payments,
    queryFn: fetchAdminPayments
  });

  const payments = paymentsQuery.data || [];

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
              className={status === item ? "admin-filter is-active" : "admin-filter"}
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

      {paymentsQuery.isLoading ? (
        <LoadingSpinner label="Loading payments…" size="lg" />
      ) : null}

      {paymentsQuery.isError ? (
        <p className="admin-state admin-state--error">
          {paymentsQuery.error instanceof Error
            ? paymentsQuery.error.message
            : "Failed to load payments"}
        </p>
      ) : null}

      {!paymentsQuery.isLoading &&
      !paymentsQuery.isError &&
      filtered.length === 0 ? (
        <p className="admin-empty">No payments match your filters.</p>
      ) : null}

      {!paymentsQuery.isLoading &&
      !paymentsQuery.isError &&
      filtered.length > 0 ? (
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
