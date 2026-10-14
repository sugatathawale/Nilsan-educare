"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Pencil, Trash2 } from "lucide-react";
import { apiRequest, apiUpload, mediaUrl, ApiRequestError } from "@/lib/api";
import { adminKeys, fetchAdminGallery } from "@/lib/admin-queries";
import {
  GALLERY_TABS,
  type GalleryCategory,
  type GalleryImage
} from "@/lib/gallery";
import { cx } from "@/lib/utils";

export default function AdminGalleryPage() {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<GalleryCategory>("RESULTS");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [editCategory, setEditCategory] = useState<GalleryCategory>("RESULTS");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const activeTab = useMemo(
    () => GALLERY_TABS.find((tab) => tab.key === category),
    [category]
  );

  const galleryQuery = useQuery({
    queryKey: adminKeys.gallery(category),
    queryFn: () => fetchAdminGallery(category)
  });

  const images = galleryQuery.data || [];

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setFile(null);
    setEditCategory(category);
  }

  function startEdit(image: GalleryImage) {
    setEditingId(image.id);
    setTitle(image.title || "");
    setEditCategory(image.category);
    setFile(null);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!editingId && !file) {
        throw new Error("Choose an image to upload.");
      }

      const formData = new FormData();
      if (file) formData.append("image", file);
      formData.append("category", editingId ? editCategory : category);
      if (title.trim()) formData.append("title", title.trim());
      else if (editingId) formData.append("title", "");

      if (editingId) {
        return apiUpload<{ image: GalleryImage }>(
          `/gallery/${editingId}`,
          formData,
          "PATCH"
        );
      }

      return apiUpload<{ image: GalleryImage }>("/gallery", formData);
    },
    onSuccess: async () => {
      const label =
        GALLERY_TABS.find(
          (tab) => tab.key === (editingId ? editCategory : category)
        )?.label || "Gallery";
      setMessage(
        editingId ? `${label} image updated.` : `${label} image uploaded.`
      );
      const invalidateCats = new Set<GalleryCategory>([
        category,
        editCategory
      ]);
      resetForm();
      await Promise.all(
        [...invalidateCats].map((cat) =>
          queryClient.invalidateQueries({ queryKey: adminKeys.gallery(cat) })
        )
      );
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest<null>(`/gallery/${id}`, { method: "DELETE" });
      return id;
    },
    onSuccess: async () => {
      setMessage("Image deleted.");
      if (editingId) resetForm();
      await queryClient.invalidateQueries({
        queryKey: adminKeys.gallery(category)
      });
    }
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    try {
      await saveMutation.mutateAsync();
    } catch {
      // surfaced below
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this image?")) return;
    setMessage("");
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      // surfaced below
    }
  }

  const error =
    (saveMutation.error instanceof ApiRequestError ||
    saveMutation.error instanceof Error
      ? saveMutation.error.message
      : "") ||
    (deleteMutation.error instanceof Error
      ? deleteMutation.error.message
      : "") ||
    (galleryQuery.error instanceof Error ? galleryQuery.error.message : "");

  const editingImage = editingId
    ? images.find((image) => image.id === editingId)
    : null;

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-eyebrow">Gallery</p>
          <h1>Manage Gallery</h1>
          <p>Upload, edit, or delete photos for Events, Results, and Classroom.</p>
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
            onClick={() => {
              setCategory(tab.key);
              if (!editingId) setEditCategory(tab.key);
            }}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-panel__header" style={{ marginBottom: 0 }}>
          <div>
            <p className="admin-eyebrow">{editingId ? "Edit" : "Upload"}</p>
            <h2>{editingId ? "Edit gallery image" : "Add gallery image"}</h2>
          </div>
          {editingImage ? (
            <div
              className="admin-gallery-card__media"
              style={{ position: "relative", width: 72, height: 48 }}
            >
              <Image
                alt={editingImage.title || "Gallery image"}
                fill
                sizes="72px"
                src={mediaUrl(editingImage.imageUrl)}
                unoptimized
              />
            </div>
          ) : null}
        </div>

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
          {editingId ? (
            <label>
              Category
              <select
                onChange={(event) =>
                  setEditCategory(event.target.value as GalleryCategory)
                }
                value={editCategory}
              >
                {GALLERY_TABS.map((tab) => (
                  <option key={tab.key} value={tab.key}>
                    {tab.label}
                  </option>
                ))}
              </select>
            </label>
          ) : (
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
          )}
        </div>

        {editingId ? (
          <label className="admin-file-field">
            <span>
              <ImagePlus size={18} />
              Replace image (optional)
            </span>
            <input
              accept="image/*"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              type="file"
            />
            <small>
              {file
                ? `${file.name} (${Math.round(file.size / 1024)} KB)`
                : "Leave empty to keep the current photo"}
            </small>
          </label>
        ) : null}

        <div className="admin-form__actions">
          <button
            className="admin-primary-action"
            disabled={saveMutation.isPending}
            type="submit"
          >
            {editingId ? <Pencil size={16} /> : <ImagePlus size={16} />}
            {saveMutation.isPending
              ? "Saving..."
              : editingId
                ? "Update image"
                : `Upload to ${activeTab?.label}`}
          </button>
          {editingId ? (
            <button
              className="admin-secondary-action"
              onClick={resetForm}
              type="button"
            >
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>

      {message ? <p className="admin-flash">{message}</p> : null}
      {error ? <p className="admin-state admin-state--error">{error}</p> : null}
      {galleryQuery.isLoading ? (
        <p className="admin-state">Loading images...</p>
      ) : null}

      {!galleryQuery.isLoading && images.length === 0 ? (
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
                <div className="admin-form__actions">
                  <button
                    className="admin-secondary-action"
                    onClick={() => startEdit(image)}
                    type="button"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>
                  <button
                    className="admin-danger-action"
                    onClick={() => void handleDelete(image.id)}
                    type="button"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
