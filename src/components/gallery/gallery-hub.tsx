"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiRequest, mediaUrl } from "@/lib/api";
import {
  GALLERY_TABS,
  type GalleryCategory,
  type GalleryImage
} from "@/lib/gallery";
import { cx } from "@/lib/utils";

type GroupedImages = Record<GalleryCategory, GalleryImage[]>;

const emptyGroups = (): GroupedImages => ({
  EVENTS: [],
  RESULTS: [],
  CLASSROOM: []
});

export function GalleryHub({
  initialCategory
}: {
  initialCategory?: GalleryCategory;
}) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState<GalleryImage | null>(null);
  const [focus, setFocus] = useState<GalleryCategory | "ALL">(
    initialCategory || "ALL"
  );

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest<{ images: GalleryImage[] }>("/gallery");
        if (alive) setImages(data.images);
      } catch (err) {
        if (alive) {
          setError(err instanceof Error ? err.message : "Failed to load gallery");
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (initialCategory) setFocus(initialCategory);
  }, [initialCategory]);

  const grouped = useMemo(() => {
    const groups = emptyGroups();
    for (const image of images) {
      groups[image.category].push(image);
    }
    return groups;
  }, [images]);

  const sections = useMemo(() => {
    if (focus === "ALL") return GALLERY_TABS;
    return GALLERY_TABS.filter((tab) => tab.key === focus);
  }, [focus]);

  return (
    <div className="gallery-page">
      <div className="site-container">
        <div className="gallery-page__hero">
          <p className="admin-eyebrow">Gallery</p>
          <h1>Moments from Nilsan Educare</h1>
          <p>
            Explore Events, Results, and Classroom photos from our live English
            journey.
          </p>
        </div>

        <div className="gallery-tabs" role="tablist" aria-label="Gallery sections">
          <button
            className={cx("gallery-tabs__item", focus === "ALL" && "is-active")}
            onClick={() => setFocus("ALL")}
            type="button"
          >
            All
          </button>
          {GALLERY_TABS.map((tab) => (
            <button
              className={cx(
                "gallery-tabs__item",
                focus === tab.key && "is-active"
              )}
              key={tab.key}
              onClick={() => setFocus(tab.key)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? <p className="admin-state">Loading gallery...</p> : null}
        {error ? <p className="admin-state admin-state--error">{error}</p> : null}

        {!loading && !error && images.length === 0 ? (
          <p className="admin-empty">
            No gallery photos yet. Admin can upload them from the Gallery panel.
          </p>
        ) : null}

        {sections.map((tab) => {
          const list = grouped[tab.key];
          return (
            <section className="gallery-section" id={tab.key.toLowerCase()} key={tab.key}>
              <div className="gallery-section__head">
                <div>
                  <h2>{tab.label}</h2>
                  <p>{tab.description}</p>
                </div>
                {focus === "ALL" ? (
                  <Link className="gallery-section__link" href={tab.href}>
                    View only {tab.label}
                  </Link>
                ) : null}
              </div>

              {list.length === 0 ? (
                <p className="gallery-section__empty">
                  No {tab.label.toLowerCase()} photos yet.
                </p>
              ) : (
                <div className="gallery-grid">
                  {list.map((image) => (
                    <button
                      className="gallery-card"
                      key={image.id}
                      onClick={() => setActive(image)}
                      type="button"
                    >
                      <span className="gallery-card__media">
                        <Image
                          alt={image.title || tab.label}
                          fill
                          sizes="(max-width: 720px) 100vw, 33vw"
                          src={mediaUrl(image.imageUrl)}
                          unoptimized
                        />
                      </span>
                      <span className="gallery-card__meta">
                        <span className="gallery-card__badge">{tab.label}</span>
                        <strong>{image.title || tab.label}</strong>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {active ? (
        <div
          className="gallery-lightbox"
          onClick={() => setActive(null)}
          role="presentation"
        >
          <div
            className="gallery-lightbox__panel"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={active.title || "Gallery photo"}
          >
            <Image
              alt={active.title || "Gallery photo"}
              height={900}
              src={mediaUrl(active.imageUrl)}
              unoptimized
              width={1400}
            />
            <div className="gallery-lightbox__meta">
              <strong>{active.title || "Gallery photo"}</strong>
              <button onClick={() => setActive(null)} type="button">
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
