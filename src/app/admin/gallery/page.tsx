"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { apiRequest, apiUpload, mediaUrl, ApiRequestError } from "@/lib/api";
import {
  GALLERY_TABS,
  type GalleryCategory,
  type GalleryImage
} from "@/lib/gallery";
import { cx } from "@/lib/utils";

export default function AdminGalleryPage() {
  const [category, setCategory] = useState<GalleryCategory>("RESULTS");
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const activeTab = useMemo(
    () => GALLERY_TABS.find((tab) => tab.key === category),
    [category]
  );

  async function load(nextCategory = category) {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest<{ images: GalleryImage[] }>(
        `/gallery?category=${nextCategory}`
      );
      setImages(data.images);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load gallery");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(category);
  }, [category]);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Choose an image to upload.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("category", category);
      if (title.trim()) formData.append("title", title.trim());

      await apiUpload<{ image: GalleryImage }>("/gallery", formData);
      setTitle("");
      setFile(null);
      setMessage(`${activeTab?.label || "Gallery"} image uploaded.`);
      await load(category);
    } catch (err) {
      setError(
        err instanceof ApiRequestError || err instanceof Error
          ? err.message
          : "Upload failed"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this image?")) return;
    setError("");
    setMessage("");

    try {
      await apiRequest<null>(`/gallery/${id}`, { method: "DELETE" });
      setImages((prev) => prev.filter((image) => image.id !== id));
      setMessage("Image deleted.");
    } catch (err) {
      setError(
        err instanceof ApiRequestError || err instanceof Error
          ? err.message
          : "Delete failed"
      );
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-eyebrow">Gallery</p>
          <h1>Manage Gallery</h1>
          <p>Upload and delete photos for Events, Results, and Classroom.</p>
        </div>
      </div>

      <div className="gallery-tabs admin-gallery-tabs">
        {GALLERY_TABS.map((tab) => (
          <button
            className={cx(
              "gallery-tabs__item",
              tab.key === category && "is-active"
            )}
            key={tab.key}
            onClick={() => setCategory(tab.key)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form className="admin-form" onSubmit={handleUpload}>
        <div className="admin-form__row">
          <label>
            Title (optional)
            <input
              onChange={(event) => setTitle(event.target.value)}
              placeholder={`e.g. ${activeTab?.label} highlight`}
              type="text"
              value={title}
            />
          </label>
          <label className="admin-file-field">
            <span>
              <ImagePlus size={18} />
              Choose image
            </span>
            <input
              accept="image/*"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              type="file"
            />
            <small>
              {file
                ? `${file.name} (${Math.round(file.size / 1024)} KB)`
                : "JPG / PNG / WEBP up to 8 MB"}
            </small>
          </label>
        </div>

        <div className="admin-form__actions">
          <button className="admin-primary-action" disabled={saving} type="submit">
            {saving ? "Uploading..." : `Upload to ${activeTab?.label}`}
          </button>
        </div>
      </form>

      {message ? <p className="admin-flash">{message}</p> : null}
      {error ? <p className="admin-state admin-state--error">{error}</p> : null}
      {loading ? <p className="admin-state">Loading images...</p> : null}

      {!loading && images.length === 0 ? (
        <p className="admin-empty">No images in {activeTab?.label} yet.</p>
      ) : null}

      {images.length > 0 ? (
        <div className="admin-gallery-grid">
          {images.map((image) => (
            <article className="admin-gallery-card" key={image.id}>
              <div className="admin-gallery-card__media">
                <Image
                  alt={image.title || "Gallery image"}
                  fill
                  sizes="280px"
                  src={mediaUrl(image.imageUrl)}
                  unoptimized
                />
              </div>
              <div className="admin-gallery-card__body">
                <strong>{image.title || "Untitled"}</strong>
                <button
                  className="admin-danger-action"
                  onClick={() => void handleDelete(image.id)}
                  type="button"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
