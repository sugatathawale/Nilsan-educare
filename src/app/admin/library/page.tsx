"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Headphones, FileText, Trash2, Upload } from "lucide-react";
import {
  apiRequest,
  apiUpload,
  formatPaise,
  mediaUrl,
  ApiRequestError
} from "@/lib/api";
import type { LibraryPlan, LibraryResource, ResourceType } from "@/lib/library";
import { cx } from "@/lib/utils";

export default function AdminLibraryPage() {
  const [plan, setPlan] = useState<LibraryPlan | null>(null);
  const [resources, setResources] = useState<LibraryResource[]>([]);
  const [type, setType] = useState<ResourceType>("NOTE");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [priceRupees, setPriceRupees] = useState("499");
  const [freeLimit, setFreeLimit] = useState("5");
  const [planTitle, setPlanTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const notes = useMemo(
    () => resources.filter((item) => item.type === "NOTE"),
    [resources]
  );
  const audiobooks = useMemo(
    () => resources.filter((item) => item.type === "AUDIOBOOK"),
    [resources]
  );

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest<{
        plan: LibraryPlan;
        resources: LibraryResource[];
      }>("/library");
      setPlan(data.plan);
      setResources(data.resources);
      setPriceRupees(String(Math.round(data.plan.pricePaise / 100)));
      setFreeLimit(String(data.plan.freeLimit));
      setPlanTitle(data.plan.title);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load library");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handlePlanSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const data = await apiRequest<{ plan: LibraryPlan }>("/library/plan", {
        method: "PUT",
        body: {
          title: planTitle,
          pricePaise: Math.round(Number(priceRupees) * 100),
          freeLimit: Number(freeLimit),
          description: plan?.description
        }
      });
      setPlan(data.plan);
      setMessage("Subscription plan updated.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update plan");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(event: FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("Choose a file to upload.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("isFree", String(isFree));
      await apiUpload("/library/resources", formData);
      setTitle("");
      setDescription("");
      setFile(null);
      setIsFree(false);
      setMessage(`${type === "NOTE" ? "Note" : "Audiobook"} uploaded.`);
      await load();
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

  async function toggleFree(resource: LibraryResource) {
    try {
      await apiRequest(`/library/resources/${resource.id}`, {
        method: "PATCH",
        body: { isFree: !resource.isFree }
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function removeResource(id: string) {
    if (!window.confirm("Delete this resource?")) return;
    try {
      await apiRequest(`/library/resources/${id}`, { method: "DELETE" });
      setResources((prev) => prev.filter((item) => item.id !== id));
      setMessage("Resource deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  function ResourceList({
    items,
    empty
  }: {
    items: LibraryResource[];
    empty: string;
  }) {
    if (items.length === 0) {
      return <p className="admin-empty">{empty}</p>;
    }

    return (
      <div className="admin-library-list">
        {items.map((item) => (
          <article className="admin-library-row" key={item.id}>
            <div>
              <strong>{item.title}</strong>
              <small>
                {item.isFree ? "Free" : "Premium"} ·{" "}
                <a href={mediaUrl(item.fileUrl || "")} target="_blank" rel="noreferrer">
                  Open file
                </a>
              </small>
            </div>
            <div className="admin-library-row__actions">
              <button
                className={cx(
                  "admin-filter",
                  item.isFree && "is-active"
                )}
                onClick={() => void toggleFree(item)}
                type="button"
              >
                {item.isFree ? "Free" : "Mark free"}
              </button>
              <button
                className="admin-danger-action"
                onClick={() => void removeResource(item.id)}
                type="button"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-eyebrow">Library</p>
          <h1>Notes & Audiobooks</h1>
          <p>
            Upload free and premium resources. Students get a few free; the rest
            need a subscription.
          </p>
        </div>
      </div>

      {message ? <p className="admin-flash">{message}</p> : null}
      {error ? <p className="admin-state admin-state--error">{error}</p> : null}
      {loading ? <p className="admin-state">Loading library...</p> : null}

      <form className="admin-form" onSubmit={handlePlanSave}>
        <div className="admin-panel__header" style={{ marginBottom: 0 }}>
          <div>
            <p className="admin-eyebrow">Pricing</p>
            <h2>Subscription plan</h2>
          </div>
          {plan ? (
            <span className="admin-toolbar__count">
              Current: {formatPaise(plan.pricePaise)} · {plan.freeLimit} free
            </span>
          ) : null}
        </div>
        <div className="admin-form__row">
          <label>
            Plan title
            <input
              onChange={(event) => setPlanTitle(event.target.value)}
              required
              type="text"
              value={planTitle}
            />
          </label>
          <label>
            Price (₹)
            <input
              min={0}
              onChange={(event) => setPriceRupees(event.target.value)}
              required
              step="1"
              type="number"
              value={priceRupees}
            />
          </label>
        </div>
        <label>
          Free items limit (students can open this many without paying)
          <input
            max={20}
            min={0}
            onChange={(event) => setFreeLimit(event.target.value)}
            required
            type="number"
            value={freeLimit}
          />
        </label>
        <div className="admin-form__actions">
          <button className="admin-primary-action" disabled={saving} type="submit">
            Save plan
          </button>
        </div>
      </form>

      <form className="admin-form" onSubmit={handleUpload}>
        <div className="admin-panel__header" style={{ marginBottom: 0 }}>
          <div>
            <p className="admin-eyebrow">Upload</p>
            <h2>Add note or audiobook</h2>
          </div>
        </div>

        <div className="gallery-tabs admin-gallery-tabs">
          <button
            className={cx("gallery-tabs__item", type === "NOTE" && "is-active")}
            onClick={() => setType("NOTE")}
            type="button"
          >
            <FileText size={16} /> Notes
          </button>
          <button
            className={cx(
              "gallery-tabs__item",
              type === "AUDIOBOOK" && "is-active"
            )}
            onClick={() => setType("AUDIOBOOK")}
            type="button"
          >
            <Headphones size={16} /> Audiobook
          </button>
        </div>

        <div className="admin-form__row">
          <label>
            Title
            <input
              onChange={(event) => setTitle(event.target.value)}
              placeholder={
                type === "NOTE" ? "Week 1 speaking notes" : "Daily English audio"
              }
              required
              type="text"
              value={title}
            />
          </label>
          <label className="admin-file-field">
            <span>
              <Upload size={18} />
              Choose file
            </span>
            <input
              accept={
                type === "NOTE"
                  ? ".pdf,.doc,.docx,application/pdf"
                  : "audio/*"
              }
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              type="file"
            />
            <small>
              {file
                ? file.name
                : type === "NOTE"
                  ? "PDF / DOC up to 80 MB"
                  : "MP3 / audio up to 80 MB"}
            </small>
          </label>
        </div>

        <label>
          Description (optional)
          <input
            onChange={(event) => setDescription(event.target.value)}
            type="text"
            value={description}
          />
        </label>

        <label className="admin-inline-check">
          <input
            checked={isFree}
            onChange={(event) => setIsFree(event.target.checked)}
            type="checkbox"
          />
          Mark as free (counts toward free limit)
        </label>

        <div className="admin-form__actions">
          <button className="admin-primary-action" disabled={saving} type="submit">
            {saving ? "Uploading..." : "Upload resource"}
          </button>
        </div>
      </form>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <p className="admin-eyebrow">Notes</p>
            <h2>{notes.length} lecture notes</h2>
          </div>
        </div>
        <ResourceList empty="No notes uploaded yet." items={notes} />
      </section>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <p className="admin-eyebrow">Audiobooks</p>
            <h2>{audiobooks.length} audio resources</h2>
          </div>
        </div>
        <ResourceList empty="No audiobooks uploaded yet." items={audiobooks} />
      </section>
    </div>
  );
}
