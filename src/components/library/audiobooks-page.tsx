"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Headphones, Lock, Unlock } from "lucide-react";
import { useStudentAuth } from "@/components/auth/student-auth-provider";
import {
  ApiRequestError,
  apiRequest,
  formatPaise,
  mediaUrl
} from "@/lib/api";
import {
  buildAuthHref,
  clearCheckoutIntent,
  requireAuthForCheckout
} from "@/lib/checkout-auth";
import type { LibraryPayload, LibraryResource } from "@/lib/library";
import {
  createLibraryOrder,
  openRazorpayCheckout,
  verifyLibraryPayment
} from "@/lib/razorpay-checkout";
import { cx } from "@/lib/utils";

function AudiobooksPageInner() {
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useStudentAuth();
  const [data, setData] = useState<LibraryPayload | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const autoStarted = useRef(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const payload = await apiRequest<LibraryPayload>("/library");
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audiobooks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [user?.id]);

  const audiobooks = useMemo(() => {
    if (!data) return [];
    return data.resources.filter((item) => item.type === "AUDIOBOOK");
  }, [data]);

  async function handleSubscribe() {
    if (authLoading) return;

    const redirected = requireAuthForCheckout({
      isLoggedIn: Boolean(user),
      nextPath: "/audiobooks?checkout=library",
      intent: { type: "library" },
      preferSignup: true
    });
    if (redirected) return;

    setSubscribing(true);
    setError("");
    setMessage("");
    try {
      const result = await createLibraryOrder();

      if ("demo" in result && result.demo) {
        clearCheckoutIntent();
        setMessage("Subscription activated. Enjoy all audiobooks.");
        await load();
        return;
      }

      const payment = await openRazorpayCheckout({
        order: result,
        description: data?.plan.title || "Library subscription",
        prefill: user
          ? { name: user.fullName, email: user.email }
          : undefined
      });

      await verifyLibraryPayment(payment);
      clearCheckoutIntent();
      setMessage("Payment successful. Premium audiobooks unlocked.");
      await load();
    } catch (err) {
      if (err instanceof Error && err.message === "Payment cancelled") {
        setError("Payment was cancelled. You can subscribe anytime.");
      } else {
        setError(
          err instanceof ApiRequestError || err instanceof Error
            ? err.message
            : "Subscribe failed"
        );
      }
    } finally {
      setSubscribing(false);
    }
  }

  useEffect(() => {
    if (authLoading || !user || autoStarted.current) return;
    if (searchParams.get("checkout") !== "library") return;
    if (data?.subscribed) {
      clearCheckoutIntent();
      return;
    }
    autoStarted.current = true;
    void handleSubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resume once after auth return
  }, [authLoading, user, searchParams, data?.subscribed]);

  function promptUnlock() {
    if (user) {
      void handleSubscribe();
      return;
    }
    requireAuthForCheckout({
      isLoggedIn: false,
      nextPath: "/audiobooks?checkout=library",
      intent: { type: "library" },
      preferSignup: true
    });
  }

  function ResourceCard({ item }: { item: LibraryResource }) {
    return (
      <article className={cx("library-card", item.locked && "is-locked")}>
        <div className="library-card__icon">
          <Headphones size={22} />
        </div>
        <div className="library-card__body">
          <div className="library-card__tags">
            <span>Audiobook</span>
            <span className={item.isFree ? "is-free" : "is-premium"}>
              {item.isFree ? "Free" : "Premium"}
            </span>
          </div>
          <strong>{item.title}</strong>
          {item.description ? <p>{item.description}</p> : null}
        </div>
        {item.locked ? (
          <button
            className="library-card__action is-locked"
            onClick={promptUnlock}
            type="button"
          >
            <Lock size={16} />
            {user ? "Unlock" : "Log in to unlock"}
          </button>
        ) : (
          <a
            className="library-card__action"
            href={mediaUrl(item.fileUrl || "")}
            rel="noreferrer"
            target="_blank"
          >
            <Unlock size={16} />
            Listen
          </a>
        )}
      </article>
    );
  }

  const authLinks = {
    login: buildAuthHref("login", "/audiobooks?checkout=library", {
      type: "library"
    }),
    signup: buildAuthHref("signup", "/audiobooks?checkout=library", {
      type: "library"
    })
  };

  return (
    <div className="audiobooks-page">
      <section className="audiobooks-page__hero">
        <div className="site-container audiobooks-page__hero-inner">
          <p className="section-eyebrow">Listen & learn</p>
          <h1>Audiobooks</h1>
          <p>
            Practice listening and pronunciation with curated English audiobooks.
            Free titles are open to everyone — subscribe only when you want premium
            access.
          </p>
          {data ? (
            <div className="audiobooks-page__plan">
              <div>
                <strong>{formatPaise(data.plan.pricePaise)}</strong>
                <span>{data.plan.title}</span>
              </div>
              {data.subscribed ? (
                <em className="is-active">Subscribed</em>
              ) : (
                <button
                  disabled={subscribing || authLoading}
                  onClick={() => void handleSubscribe()}
                  type="button"
                >
                  {subscribing
                    ? "Please wait..."
                    : user
                      ? "Subscribe now"
                      : "Log in to subscribe"}
                </button>
              )}
            </div>
          ) : null}
        </div>
      </section>

      <section className="audiobooks-page__body">
        <div className="site-container">
          {message ? <p className="admin-flash">{message}</p> : null}
          {error ? <p className="admin-state admin-state--error">{error}</p> : null}
          {loading ? <p className="admin-state">Loading audiobooks...</p> : null}

          {!loading && audiobooks.length === 0 ? (
            <p className="admin-empty">
              No audiobooks yet. Check back soon, or browse{" "}
              <Link href="/dashboard#library">lecture notes</Link>.
            </p>
          ) : null}

          <div className="library-grid">
            {audiobooks.map((item) => (
              <ResourceCard item={item} key={item.id} />
            ))}
          </div>

          {!user ? (
            <p className="library-section__hint">
              Free audiobooks are open to everyone.{" "}
              <Link href={authLinks.signup}>Create an account</Link> or{" "}
              <Link href={authLinks.login}>log in</Link> only when you want to
              unlock premium titles.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export function AudiobooksPage() {
  return (
    <Suspense
      fallback={
        <div className="audiobooks-page">
          <div className="site-container" style={{ padding: "48px 0" }}>
            <p className="admin-state">Loading audiobooks...</p>
          </div>
        </div>
      }
    >
      <AudiobooksPageInner />
    </Suspense>
  );
}
