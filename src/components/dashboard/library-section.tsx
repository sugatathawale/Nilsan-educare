"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { FileText, Headphones, Lock, Unlock } from "lucide-react";
import { useStudentAuth } from "@/components/auth/student-auth-provider";
import {
  apiRequest,
  formatPaise,
  mediaUrl,
  ApiRequestError
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

function LibrarySectionInner() {
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useStudentAuth();
  const [data, setData] = useState<LibraryPayload | null>(null);
  const [tab, setTab] = useState<"NOTE" | "AUDIOBOOK">("NOTE");
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
      setError(err instanceof Error ? err.message : "Failed to load library");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [user?.id]);

  const items = useMemo(() => {
    if (!data) return [];
    return data.resources.filter((item) => item.type === tab);
  }, [data, tab]);

  async function handleSubscribe() {
    if (authLoading) return;

    const redirected = requireAuthForCheckout({
      isLoggedIn: Boolean(user),
      nextPath: "/dashboard?checkout=library#library",
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
        setMessage("Subscription activated. Enjoy all notes and audiobooks.");
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
      setMessage("Payment successful. Premium library unlocked.");
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
    if (searchParams?.get("checkout") !== "library") return;
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
      nextPath: "/dashboard?checkout=library#library",
      intent: { type: "library" },
      preferSignup: true
    });
  }

  function ResourceCard({ item }: { item: LibraryResource }) {
    const Icon = item.type === "NOTE" ? FileText : Headphones;
    return (
      <article className={cx("library-card", item.locked && "is-locked")}>
        <div className="library-card__icon">
          <Icon size={22} />
        </div>
        <div className="library-card__body">
          <div className="library-card__tags">
            <span>{item.type === "NOTE" ? "Note" : "Audiobook"}</span>
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
            Open
          </a>
        )}
      </article>
    );
  }

  const authLinks = {
    login: buildAuthHref("login", "/dashboard?checkout=library#library", {
      type: "library"
    }),
    signup: buildAuthHref("signup", "/dashboard?checkout=library#library", {
      type: "library"
    })
  };

  return (
    <section className="library-section" id="library">
      <div className="site-container">
        <div className="library-section__head">
          <div>
            <p className="admin-eyebrow">Free & Premium</p>
            <h2>Lecture Notes & Audiobooks</h2>
            <p>
              Browse free resources first. Create an account only when you are
              ready to subscribe and unlock the full library.
            </p>
          </div>
          {data ? (
            <div className="library-plan-card">
              <span>{data.plan.title}</span>
              <strong>{formatPaise(data.plan.pricePaise)}</strong>
              <small>{data.plan.freeLimit} free items included</small>
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

        <div className="gallery-tabs">
          <button
            className={cx("gallery-tabs__item", tab === "NOTE" && "is-active")}
            onClick={() => setTab("NOTE")}
            type="button"
          >
            Notes
          </button>
          <button
            className={cx(
              "gallery-tabs__item",
              tab === "AUDIOBOOK" && "is-active"
            )}
            onClick={() => setTab("AUDIOBOOK")}
            type="button"
          >
            Audiobooks
          </button>
        </div>

        {message ? <p className="admin-flash">{message}</p> : null}
        {error ? <p className="admin-state admin-state--error">{error}</p> : null}
        {loading ? <p className="admin-state">Loading resources...</p> : null}

        {!loading && items.length === 0 ? (
          <p className="admin-empty">
            No {tab === "NOTE" ? "notes" : "audiobooks"} yet. Check back soon.
          </p>
        ) : null}

        <div className="library-grid">
          {items.map((item) => (
            <ResourceCard item={item} key={item.id} />
          ))}
        </div>

        {!user ? (
          <p className="library-section__hint">
            Free items are open to everyone.{" "}
            <Link href={authLinks.signup}>Create an account</Link> or{" "}
            <Link href={authLinks.login}>log in</Link> only when you want to pay
            for premium notes and audiobooks.
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function LibrarySection() {
  return (
    <Suspense fallback={<section className="library-section" id="library" />}>
      <LibrarySectionInner />
    </Suspense>
  );
}
