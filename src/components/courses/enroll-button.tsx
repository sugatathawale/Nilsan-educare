"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStudentAuth } from "@/components/auth/student-auth-provider";
import { ApiRequestError } from "@/lib/api";
import {
  clearCheckoutIntent,
  requireAuthForCheckout
} from "@/lib/checkout-auth";
import {
  createCourseOrder,
  openRazorpayCheckout,
  verifyCoursePayment
} from "@/lib/razorpay-checkout";
import { cx } from "@/lib/utils";

type EnrollButtonProps = {
  courseSlug: string;
  label?: string;
  className?: string;
};

export function EnrollButton({
  courseSlug,
  label = "Enrol Now",
  className
}: EnrollButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useStudentAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const autoStarted = useRef(false);

  async function startCheckout() {
    if (loading) return;

    const redirected = requireAuthForCheckout({
      isLoggedIn: Boolean(user),
      nextPath: `/courses/${courseSlug}?checkout=1`,
      intent: { type: "course", courseSlug },
      preferSignup: true
    });
    if (redirected) return;

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const order = await createCourseOrder(courseSlug);

      if ("demo" in order && order.demo) {
        clearCheckoutIntent();
        setMessage("Enrollment confirmed. Opening My Learning...");
        router.push("/my-learning");
        return;
      }

      const payment = await openRazorpayCheckout({
        order,
        description: order.course?.title || "Course enrollment",
        prefill: user
          ? { name: user.fullName, email: user.email }
          : undefined
      });

      const verified = await verifyCoursePayment(payment);
      clearCheckoutIntent();
      setMessage(
        verified.alreadyPaid
          ? "You are already enrolled. Opening My Learning..."
          : "Payment successful. Opening My Learning..."
      );
      router.push("/my-learning");
    } catch (err) {
      if (err instanceof Error && err.message === "Payment cancelled") {
        setError("Payment was cancelled. You can try again anytime.");
      } else {
        setError(
          err instanceof ApiRequestError || err instanceof Error
            ? err.message
            : "Unable to start payment"
        );
      }
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (loading || !user || autoStarted.current) return;
    if (searchParams.get("checkout") !== "1") return;
    autoStarted.current = true;
    void startCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once after auth return
  }, [loading, user, searchParams]);

  return (
    <div className="enroll-button">
      <button
        className={cx("course-details__enroll", className)}
        disabled={busy || loading}
        onClick={() => void startCheckout()}
        type="button"
      >
        {busy
          ? "Processing..."
          : user
            ? label
            : "Log in to enrol"}
      </button>
      {error ? <p className="enroll-button__error">{error}</p> : null}
      {message ? <p className="enroll-button__ok">{message}</p> : null}
    </div>
  );
}
