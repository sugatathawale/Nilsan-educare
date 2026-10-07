"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FileText, Headphones, Lock, Unlock } from "lucide-react";
import { useStudentAuth } from "@/components/auth/student-auth-provider";
import {
  apiRequest,
  formatPaise,
  mediaUrl,
  ApiRequestError
} from "@/lib/api";
import type { LibraryPayload, LibraryResource } from "@/lib/library";
import { cx } from "@/lib/utils";

export function LibrarySection() {
  const { user } = useStudentAuth();
  const [data, setData] = useState<LibraryPayload | null>(null);
  const [tab, setTab] = useState<"NOTE" | "AUDIOBOOK">("NOTE");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

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
    if (!user) {
      window.location.href = "/login";
      return;
    }

    setSubscribing(true);
    setError("");
    setMessage("");
    try {
      const result = await apiRequest<{ demo?: boolean }>("/library/subscribe", {
        method: "POST"
      });
      setMessage(
        result.demo
          ? "Subscription activated. Enjoy all notes and audiobooks."
          : "Subscription started."
      );
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError || err instanceof Error
          ? err.message
          : "Subscribe failed"
      );
    } finally {
      setSubscribing(false);
    }
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
          <button className="library-card__action is-locked" disabled type="button">
            <Lock size={16} />
            Locked
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

  return (
    <section className="library-section">
      <div className="site-container">
        <div className="library-section__head">
          <div>
            <p className="admin-eyebrow">Free & Premium</p>
            <h2>Lecture Notes & Audiobooks</h2>
            <p>
              Browse free resources first. Subscribe to unlock the full library.
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
                  disabled={subscribing}
                  onClick={() => void handleSubscribe()}
                  type="button"
                >
                  {user ? (subscribing ? "Please wait..." : "Subscribe now") : "Login to subscribe"}
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
            <Link href="/signup">Create an account</Link> to subscribe and unlock
            premium content.
          </p>
        ) : null}
      </div>
    </section>
  );
}
