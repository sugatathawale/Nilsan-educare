"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Pencil, Trash2, Upload } from "lucide-react";
import {
  apiRequest,
  apiUpload,
  mediaUrl,
  ApiRequestError
} from "@/lib/api";
import { adminKeys, fetchAdminLibrary } from "@/lib/admin-queries";
import {
  MATERIAL_SECTIONS,
  materialSectionLabel,
  type LibraryResource,
  type MaterialSection
} from "@/lib/library";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cx } from "@/lib/utils";

export default function AdminStudyMaterialsPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [section, setSection] = useState<MaterialSection>("NOTES");
  const [filter, setFilter] = useState<MaterialSection | "ALL">("ALL");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const libraryQuery = useQuery({
    queryKey: adminKeys.library,
    queryFn: fetchAdminLibrary
  });

  const materials = useMemo(() => {
    const list = (libraryQuery.data?.resources || []).filter(
      (item) => item.type === "NOTE"
    );
    if (filter === "ALL") return list;
    return list.filter((item) => item.section === filter);
  }, [libraryQuery.data, filter]);

  function resetForm() {
    setEditingId(null);
    setSection("NOTES");
    setTitle("");
    setDescription("");
    setFile(null);
    setIsFree(true);
  }

  function startEdit(resource: LibraryResource) {
    setEditingId(resource.id);
    setSection(resource.section || "NOTES");
    setTitle(resource.title);
    setDescription(resource.description || "");
    setIsFree(resource.isFree);
    setFile(null);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!editingId && !file) {
        throw new Error("Choose a PDF or document to upload.");
      }

      const formData = new FormData();
      if (file) formData.append("file", file);
      formData.append("type", "NOTE");
      formData.append("section", section);
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("isFree", String(isFree));

      if (editingId) {
        return apiUpload(`/library/resources/${editingId}`, formData, "PATCH");
      }
      return apiUpload("/library/resources", formData);
    },
    onSuccess: async () => {
      setMessage(editingId ? "Material updated." : "Study material uploaded.");
      resetForm();
      await queryClient.invalidateQueries({ queryKey: adminKeys.library });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest<null>(`/library/resources/${id}`, { method: "DELETE" });
    },
    onSuccess: async () => {
      setMessage("Material deleted.");
      await queryClient.invalidateQueries({ queryKey: adminKeys.library });
    }
  });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      await saveMutation.mutateAsync();
    } catch (error) {
      setMessage(
        error instanceof ApiRequestError || error instanceof Error
          ? error.message
          : "Could not save material"
      );
    }
  }

  const busy = saveMutation.isPending || deleteMutation.isPending;
  const errorMessage =
    message ||
    (libraryQuery.error instanceof Error ? libraryQuery.error.message : "");

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-eyebrow">Content</p>
          <h1>Study Materials</h1>
          <p>
            Choose a section (Books, Notes, Worksheets, Practice), then upload
            the file students can download.
          </p>
        </div>
      </div>

      {errorMessage ? (
        <p
          className={
            message.includes("uploaded") ||
            message.includes("updated") ||
            message.includes("deleted")
              ? "admin-state"
              : "admin-state admin-state--error"
          }
        >
          {errorMessage}
        </p>
      ) : null}

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <p className="admin-eyebrow">Upload</p>
            <h2>{editingId ? "Edit material" : "Add study material"}</h2>
          </div>
        </div>

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="gallery-tabs admin-gallery-tabs">
            {MATERIAL_SECTIONS.map((item) => (
              <button
                key={item.key}
                className={cx(
                  "gallery-tabs__item",
                  section === item.key && "is-active"
                )}
                type="button"
                onClick={() => setSection(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="admin-muted">
            {MATERIAL_SECTIONS.find((item) => item.key === section)?.hint}
          </p>

          <label>
            Title
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={
                section === "BOOKS"
                  ? "e.g. Spoken English Handbook"
                  : "e.g. Daily Conversation Starter Pack"
              }
            />
          </label>

          <label>
            Description
            <textarea
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Short note about what students will get"
            />
          </label>

          <label>
            File (PDF / DOC)
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="checkbox"
              checked={isFree}
              onChange={(event) => setIsFree(event.target.checked)}
            />
            Free for all students
          </label>

          <div className="admin-form__actions">
            <button className="admin-primary-action" disabled={busy} type="submit">
              <Upload size={16} />
              {editingId ? "Save changes" : `Upload to ${materialSectionLabel(section)}`}
            </button>
            {editingId ? (
              <button
                className="admin-secondary-action"
                type="button"
                onClick={resetForm}
              >
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <p className="admin-eyebrow">Library</p>
            <h2>Published materials</h2>
          </div>
        </div>

        <div className="gallery-tabs admin-gallery-tabs">
          <button
            className={cx("gallery-tabs__item", filter === "ALL" && "is-active")}
            type="button"
            onClick={() => setFilter("ALL")}
          >
            All
          </button>
          {MATERIAL_SECTIONS.map((item) => (
            <button
              key={item.key}
              className={cx(
                "gallery-tabs__item",
                filter === item.key && "is-active"
              )}
              type="button"
              onClick={() => setFilter(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {libraryQuery.isLoading ? (
          <LoadingSpinner label="Loading materials…" />
        ) : null}

        {!libraryQuery.isLoading && materials.length === 0 ? (
          <p className="admin-empty">
            No study materials in this section yet. Upload one above.
          </p>
        ) : null}

        <div className="admin-library-list">
          {materials.map((item) => (
            <article className="admin-library-row" key={item.id}>
              <div>
                <strong>
                  <FileText size={16} style={{ marginRight: 8, verticalAlign: -3 }} />
                  {item.title}
                </strong>
                <small>
                  {materialSectionLabel(item.section)} ·{" "}
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
                  type="button"
                  onClick={() => startEdit(item)}
                >
                  <Pencil size={16} />
                  Edit
                </button>
                <button
                  className="admin-danger-action"
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete “${item.title}”?`)) {
                      void deleteMutation.mutateAsync(item.id);
                    }
                  }}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
