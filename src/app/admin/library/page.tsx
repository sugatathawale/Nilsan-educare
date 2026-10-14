"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Headphones, FileText, Pencil, Trash2, Upload } from "lucide-react";
import {
  apiRequest,
  apiUpload,
  formatPaise,
  mediaUrl,
  ApiRequestError
} from "@/lib/api";
import { adminKeys, fetchAdminLibrary } from "@/lib/admin-queries";
import type { LibraryPlan, LibraryResource, ResourceType } from "@/lib/library";
import { cx } from "@/lib/utils";

export default function AdminLibraryPage() {
  const queryClient = useQueryClient();
  const [type, setType] = useState<ResourceType>("NOTE");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [priceRupees, setPriceRupees] = useState("499");
  const [freeLimit, setFreeLimit] = useState("5");
  const [planTitle, setPlanTitle] = useState("");
  const [message, setMessage] = useState("");

  const libraryQuery = useQuery({
    queryKey: adminKeys.library,
    queryFn: fetchAdminLibrary
  });

  const plan = libraryQuery.data?.plan || null;
  const resources = libraryQuery.data?.resources || [];

  useEffect(() => {
    if (!plan) return;
    setPriceRupees(String(Math.round(plan.pricePaise / 100)));
    setFreeLimit(String(plan.freeLimit));
    setPlanTitle(plan.title);
  }, [plan]);

  const notes = useMemo(
    () => resources.filter((item) => item.type === "NOTE"),
    [resources]
  );
  const audiobooks = useMemo(
    () => resources.filter((item) => item.type === "AUDIOBOOK"),
    [resources]
  );

  function resetResourceForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setFile(null);
    setIsFree(false);
    setType("NOTE");
  }

  function startEdit(resource: LibraryResource) {
    setEditingId(resource.id);
    setType(resource.type);
    setTitle(resource.title);
    setDescription(resource.description || "");
    setIsFree(resource.isFree);
    setFile(null);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const planMutation = useMutation({
    mutationFn: async () => {
      return apiRequest<{ plan: LibraryPlan }>("/library/plan", {
        method: "PUT",
        body: {
          title: planTitle,
          pricePaise: Math.round(Number(priceRupees) * 100),
          freeLimit: Number(freeLimit),
          description: plan?.description
        }
      });
    },
    onSuccess: async () => {
      setMessage("Subscription plan updated.");
      await queryClient.invalidateQueries({ queryKey: adminKeys.library });
    }
  });

  const saveResourceMutation = useMutation({
    mutationFn: async () => {
      if (!editingId && !file) {
        throw new Error("Choose a file to upload.");
      }

      const formData = new FormData();
      if (file) formData.append("file", file);
      formData.append("type", type);
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("isFree", String(isFree));

      if (editingId) {
        return apiUpload(`/library/resources/${editingId}`, formData, "PATCH");
      }
      return apiUpload("/library/resources", formData);
    },
    onSuccess: async () => {
      setMessage(
        editingId
          ? "Resource updated."
          : `${type === "NOTE" ? "Note" : "Audiobook"} uploaded.`
      );
      resetResourceForm();
      await queryClient.invalidateQueries({ queryKey: adminKeys.library });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/library/resources/${id}`, { method: "DELETE" });
      return id;
    },
    onSuccess: async () => {
      setMessage("Resource deleted.");
      if (editingId) resetResourceForm();
      await queryClient.invalidateQueries({ queryKey: adminKeys.library });
    }
  });

  async function handlePlanSave(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      await planMutation.mutateAsync();
    } catch {
      // surfaced below
    }
  }

  async function handleResourceSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      await saveResourceMutation.mutateAsync();
    } catch {
      // surfaced below
    }
  }

  async function removeResource(id: string) {
    if (!window.confirm("Delete this resource?")) return;
    setMessage("");
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      // surfaced below
    }
  }

  const saving =
    planMutation.isPending ||
    saveResourceMutation.isPending ||
    deleteMutation.isPending;

  const error =
    (libraryQuery.error instanceof Error
      ? libraryQuery.error.message
      : "") ||
    (planMutation.error instanceof Error ? planMutation.error.message : "") ||
    (saveResourceMutation.error instanceof ApiRequestError ||
    saveResourceMutation.error instanceof Error
      ? saveResourceMutation.error.message
      : "") ||
    (deleteMutation.error instanceof Error
      ? deleteMutation.error.message
      : "");

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
                {item.isFree ? "Free" : "Premium"}
                {item.description ? ` · ${item.description}` : ""}
                {item.fileUrl ? (
                  <>
                    {" · "}
                    <a
                      href={mediaUrl(item.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open file
                    </a>
                  </>
                ) : null}
              </small>
            </div>
            <div className="admin-library-row__actions">
              <button
                className="admin-secondary-action"
                onClick={() => startEdit(item)}
                type="button"
              >
                <Pencil size={16} />
                Edit
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
            Upload and edit free or premium resources. Students get a few free;
            the rest need a subscription.
          </p>
        </div>
      </div>

      {message ? <p className="admin-flash">{message}</p> : null}
      {error ? <p className="admin-state admin-state--error">{error}</p> : null}
      {libraryQuery.isLoading ? (
        <p className="admin-state">Loading library...</p>
      ) : null}

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
            <Pencil size={16} />
            Save plan
          </button>
        </div>
      </form>

      <form className="admin-form" onSubmit={handleResourceSubmit}>
        <div className="admin-panel__header" style={{ marginBottom: 0 }}>
          <div>
            <p className="admin-eyebrow">{editingId ? "Edit" : "Upload"}</p>
            <h2>
              {editingId ? "Edit note or audiobook" : "Add note or audiobook"}
            </h2>
          </div>
        </div>

        <div className="gallery-tabs admin-gallery-tabs">
          <button
            className={cx("gallery-tabs__item", type === "NOTE" && "is-active")}
            disabled={Boolean(editingId)}
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
            disabled={Boolean(editingId)}
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
              {editingId ? "Replace file (optional)" : "Choose file"}
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
                : editingId
                  ? "Leave empty to keep the current file"
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
            {editingId ? <Pencil size={16} /> : <Upload size={16} />}
            {saving
              ? "Saving..."
              : editingId
                ? "Update resource"
                : "Upload resource"}
          </button>
          {editingId ? (
            <button
              className="admin-secondary-action"
              onClick={resetResourceForm}
              type="button"
            >
              Cancel edit
            </button>
          ) : null}
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
