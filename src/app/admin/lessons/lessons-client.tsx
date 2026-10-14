"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { apiRequest, apiUpload, mediaUrl, ApiRequestError } from "@/lib/api";
import {
  adminKeys,
  fetchAdminCoursesActive,
  fetchAdminLessons,
  fetchBunnyConfig
} from "@/lib/admin-queries";
import type { LessonItem } from "@/lib/admin-types";
import { toEmbedVideoUrl, videoProviderLabel } from "@/lib/video-url";

export default function AdminLessonsClient() {
  const searchParams = useSearchParams();
  const presetCourse = searchParams.get("course") || "";
  const queryClient = useQueryClient();

  const [courseSlug, setCourseSlug] = useState(presetCourse);
  const [showForm, setShowForm] = useState(Boolean(presetCourse));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState("1");
  const [duration, setDuration] = useState("");
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [manualVideoId, setManualVideoId] = useState("");
  const [message, setMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");
  const [noteLessonId, setNoteLessonId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteFile, setNoteFile] = useState<File | null>(null);

  const coursesQuery = useQuery({
    queryKey: [...adminKeys.courses, "active"] as const,
    queryFn: fetchAdminCoursesActive
  });

  const bunnyQuery = useQuery({
    queryKey: adminKeys.bunnyConfig,
    queryFn: fetchBunnyConfig
  });

  const courses = coursesQuery.data || [];
  const bunny = bunnyQuery.data || null;

  useEffect(() => {
    if (!courseSlug && courses[0]?.slug) {
      setCourseSlug(courses[0].slug);
    }
  }, [courseSlug, courses]);

  const lessonsQuery = useQuery({
    queryKey: adminKeys.lessons(courseSlug),
    queryFn: () => fetchAdminLessons(courseSlug),
    enabled: Boolean(courseSlug)
  });

  const lessons = lessonsQuery.data || [];

  useEffect(() => {
    if (editingId) return;
    const nextOrder =
      lessons.reduce((max, lesson) => Math.max(max, lesson.order), 0) + 1;
    setOrder(String(nextOrder));
  }, [lessons, editingId]);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDuration("");
    setVideoUrlInput("");
    setVideoFile(null);
    setManualVideoId("");
    setUploadProgress("");
    setShowForm(false);
  }

  function startEdit(lesson: LessonItem) {
    setEditingId(lesson.id);
    setShowForm(true);
    setTitle(lesson.title);
    setOrder(String(lesson.order));
    setDuration(lesson.duration || "");
    setVideoUrlInput(lesson.videoUrl || lesson.embedUrl || "");
    setManualVideoId(lesson.videoId || "");
    setVideoFile(null);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      let videoId = manualVideoId.trim() || undefined;
      let videoUrl: string | undefined =
        toEmbedVideoUrl(videoUrlInput) || undefined;

      if (videoFile) {
        if (!bunny?.configured) {
          throw new Error(
            "Bunny Stream is not configured. Add keys in backend/.env first, or paste a YouTube URL instead."
          );
        }

        setUploadProgress("Creating Bunny video entry...");
        const created = await apiRequest<{
          videoId: string;
          embedUrl: string;
        }>("/lessons/videos", {
          method: "POST",
          body: { title: title.trim() }
        });

        videoId = created.videoId;
        videoUrl = created.embedUrl;

        setUploadProgress("Uploading video file to Bunny Stream...");
        const uploaded = await apiUpload<{
          videoId: string;
          embedUrl: string;
        }>(`/lessons/videos/${videoId}/upload`, formDataFromVideo(videoFile));

        videoUrl = uploaded.embedUrl;
        setUploadProgress("Saving lesson...");
      } else if (videoUrl) {
        setUploadProgress(
          editingId ? "Updating lesson..." : "Saving lesson with video URL..."
        );
      }

      const payload: Record<string, string | number> = {
        title: title.trim(),
        order: Number(order)
      };

      if (duration.trim()) payload.duration = duration.trim();
      else if (editingId) payload.duration = "";

      if (videoId) payload.videoId = videoId;
      if (videoUrl) payload.videoUrl = videoUrl;

      if (editingId) {
        await apiRequest<{ lesson: LessonItem }>(`/lessons/${editingId}`, {
          method: "PATCH",
          body: payload
        });
        return "updated" as const;
      }

      await apiRequest<{ lesson: LessonItem }>("/lessons", {
        method: "POST",
        body: { ...payload, courseSlug }
      });
      return "created" as const;
    },
    onSuccess: async (mode) => {
      setUploadProgress("");
      setMessage(
        mode === "updated"
          ? "Lesson updated."
          : videoFile
            ? "Lesson saved. Bunny may take a few minutes to finish encoding the video."
            : "Lesson created successfully."
      );
      resetForm();
      await queryClient.invalidateQueries({
        queryKey: adminKeys.lessons(courseSlug)
      });
    },
    onError: () => {
      setUploadProgress("");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest<null>(`/lessons/${id}`, { method: "DELETE" });
      return id;
    },
    onSuccess: async () => {
      setMessage("Lesson deleted.");
      if (editingId) resetForm();
      await queryClient.invalidateQueries({
        queryKey: adminKeys.lessons(courseSlug)
      });
    }
  });

  const noteMutation = useMutation({
    mutationFn: async () => {
      if (!noteLessonId || !noteFile) {
        throw new Error("Choose a lesson note file.");
      }
      const formData = new FormData();
      formData.append("file", noteFile);
      if (noteTitle.trim()) formData.append("title", noteTitle.trim());
      await apiUpload(`/lessons/${noteLessonId}/notes`, formData);
    },
    onSuccess: async () => {
      setNoteFile(null);
      setNoteTitle("");
      setNoteLessonId(null);
      setMessage("Lecture note uploaded.");
      await queryClient.invalidateQueries({
        queryKey: adminKeys.lessons(courseSlug)
      });
    }
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      await apiRequest<null>(`/lessons/notes/${noteId}`, { method: "DELETE" });
    },
    onSuccess: async () => {
      setMessage("Lecture note deleted.");
      await queryClient.invalidateQueries({
        queryKey: adminKeys.lessons(courseSlug)
      });
    }
  });

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    try {
      await saveMutation.mutateAsync();
    } catch {
      // surfaced below
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this lesson and its Bunny video (if any)?")) {
      return;
    }
    setMessage("");
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      // surfaced below
    }
  }

  async function handleNoteUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    try {
      await noteMutation.mutateAsync();
    } catch {
      // surfaced below
    }
  }

  async function handleDeleteNote(noteId: string) {
    if (!window.confirm("Delete this lecture note?")) return;
    setMessage("");
    try {
      await deleteNoteMutation.mutateAsync(noteId);
    } catch {
      // surfaced below
    }
  }

  const loading =
    coursesQuery.isLoading ||
    bunnyQuery.isLoading ||
    (Boolean(courseSlug) && lessonsQuery.isLoading);

  const saving =
    saveMutation.isPending ||
    noteMutation.isPending ||
    deleteMutation.isPending;

  const error =
    (coursesQuery.error instanceof Error
      ? coursesQuery.error.message
      : "") ||
    (lessonsQuery.error instanceof Error
      ? lessonsQuery.error.message
      : "") ||
    (saveMutation.error instanceof ApiRequestError ||
    saveMutation.error instanceof Error
      ? saveMutation.error.message
      : "") ||
    (deleteMutation.error instanceof Error
      ? deleteMutation.error.message
      : "") ||
    (noteMutation.error instanceof ApiRequestError ||
    noteMutation.error instanceof Error
      ? noteMutation.error.message
      : "") ||
    (deleteNoteMutation.error instanceof Error
      ? deleteNoteMutation.error.message
      : "");

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-eyebrow">Lessons</p>
          <h1>Lesson Management</h1>
          <p>
            Attach lectures via YouTube (unlisted) URL or Bunny Stream upload.
            Edit any lesson to change title, order, duration, or video.
          </p>
        </div>
        <button
          className="admin-primary-action"
          disabled={!courseSlug}
          onClick={() => {
            if (showForm && editingId) {
              resetForm();
              return;
            }
            setShowForm((value) => !value);
            setEditingId(null);
            setMessage("");
          }}
          type="button"
        >
          <Plus size={18} />
          {showForm ? "Close form" : "Add Lesson"}
        </button>
      </div>

      <div
        className={
          bunny?.configured
            ? "admin-config-banner is-ok"
            : "admin-config-banner is-warn"
        }
      >
        <strong>Bunny Stream</strong>
        <span>
          {bunny?.configured
            ? `Connected · Library ${bunny.libraryId}${
                bunny.cdnHostname ? ` · CDN ${bunny.cdnHostname}` : ""
              }`
            : "Not configured — set BUNNY_STREAM_* keys in backend/.env (see SETUP.md)"}
        </span>
      </div>

      <div className="admin-toolbar">
        <label className="admin-select-field">
          Course
          <select
            onChange={(event) => {
              setCourseSlug(event.target.value);
              resetForm();
            }}
            value={courseSlug}
          >
            {courses.length === 0 ? <option value="">No courses</option> : null}
            {courses.map((course) => (
              <option key={course.id} value={course.slug}>
                {course.title}
              </option>
            ))}
          </select>
        </label>
        <span className="admin-toolbar__count">{lessons.length} lessons</span>
      </div>

      {message ? <p className="admin-flash">{message}</p> : null}
      {error ? <p className="admin-state admin-state--error">{error}</p> : null}
      {loading ? <p className="admin-state">Loading...</p> : null}

      {showForm ? (
        <form className="admin-form" onSubmit={handleSave}>
          <div className="admin-panel__header" style={{ marginBottom: 0 }}>
            <div>
              <p className="admin-eyebrow">{editingId ? "Edit" : "Create"}</p>
              <h2>{editingId ? "Edit lesson" : "Add lesson"}</h2>
            </div>
          </div>

          <div className="admin-form__row">
            <label>
              Lesson title
              <input
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Week 1 - Confidence & Everyday English"
                required
                type="text"
                value={title}
              />
            </label>
            <label>
              Order
              <input
                min={1}
                onChange={(event) => setOrder(event.target.value)}
                required
                type="number"
                value={order}
              />
            </label>
          </div>

          <div className="admin-form__row">
            <label>
              Duration
              <input
                onChange={(event) => setDuration(event.target.value)}
                placeholder="45 min"
                type="text"
                value={duration}
              />
            </label>
            <label>
              Existing Bunny video ID (optional)
              <input
                onChange={(event) => setManualVideoId(event.target.value)}
                placeholder="Only if video already exists in Bunny"
                type="text"
                value={manualVideoId}
              />
            </label>
          </div>

          <label>
            YouTube / video URL
            <input
              onChange={(event) => {
                setVideoUrlInput(event.target.value);
                if (event.target.value.trim()) setVideoFile(null);
              }}
              placeholder="https://www.youtube.com/watch?v=… or youtu.be/… (unlisted OK)"
              type="url"
              value={videoUrlInput}
            />
            <small className="admin-field-hint">
              Paste a watch, share, or embed link. It is converted to an embed URL
              automatically.
            </small>
          </label>

          <label className="admin-file-field">
            <span>
              <Upload size={18} />
              {editingId
                ? "Replace lecture video (Bunny Stream)"
                : "Or upload lecture video (Bunny Stream)"}
            </span>
            <input
              accept="video/*"
              onChange={(event) => {
                const next = event.target.files?.[0] || null;
                setVideoFile(next);
                if (next) setVideoUrlInput("");
              }}
              type="file"
            />
            <small>
              {videoFile
                ? `${videoFile.name} (${Math.round(videoFile.size / (1024 * 1024))} MB)`
                : editingId
                  ? "Optional. Leave empty to keep the current video."
                  : "Optional. MP4 / MOV up to 500 MB. Requires Bunny Stream keys."}
            </small>
          </label>

          {uploadProgress ? (
            <p className="admin-flash">{uploadProgress}</p>
          ) : null}

          <div className="admin-form__actions">
            <button
              className="admin-secondary-action"
              onClick={resetForm}
              type="button"
            >
              Cancel
            </button>
            <button
              className="admin-primary-action"
              disabled={saving}
              type="submit"
            >
              {editingId ? <Pencil size={16} /> : <Plus size={16} />}
              {saving ? "Saving..." : editingId ? "Update lesson" : "Save lesson"}
            </button>
          </div>
        </form>
      ) : null}

      {!loading && lessons.length === 0 ? (
        <p className="admin-empty">No lessons for this course yet.</p>
      ) : null}

      {lessons.length > 0 ? (
        <div className="admin-lesson-stack">
          {lessons.map((lesson) => (
            <article className="admin-lesson-card" key={lesson.id}>
              <div className="admin-lesson-card__top">
                <div>
                  <small>Lesson {lesson.order}</small>
                  <strong>{lesson.title}</strong>
                  <span>
                    {lesson.duration || "No duration"} ·{" "}
                    {lesson.videoId || lesson.videoUrl
                      ? videoProviderLabel(
                          lesson.embedUrl || lesson.videoUrl
                        )
                      : "No video"}
                  </span>
                </div>
                <div className="admin-lesson-card__actions">
                  <button
                    className="admin-secondary-action"
                    onClick={() => startEdit(lesson)}
                    type="button"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>
                  {lesson.embedUrl || lesson.videoUrl ? (
                    <a
                      className="admin-secondary-action"
                      href={lesson.embedUrl || lesson.videoUrl || undefined}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Open player
                    </a>
                  ) : null}
                  <button
                    className="admin-secondary-action"
                    onClick={() =>
                      setNoteLessonId((current) =>
                        current === lesson.id ? null : lesson.id
                      )
                    }
                    type="button"
                  >
                    <FileText size={16} />
                    Add note
                  </button>
                  <button
                    className="admin-danger-action"
                    onClick={() => void handleDelete(lesson.id)}
                    type="button"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>

              {(lesson.notes || []).length > 0 ? (
                <ul className="admin-note-list">
                  {(lesson.notes || []).map((note) => (
                    <li key={note.id}>
                      <a
                        href={mediaUrl(note.fileUrl)}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {note.title}
                      </a>
                      <button
                        className="admin-danger-action"
                        onClick={() => void handleDeleteNote(note.id)}
                        type="button"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="admin-note-empty">No lecture notes yet.</p>
              )}

              {noteLessonId === lesson.id ? (
                <form className="admin-note-form" onSubmit={handleNoteUpload}>
                  <input
                    onChange={(event) => setNoteTitle(event.target.value)}
                    placeholder="Note title (optional)"
                    type="text"
                    value={noteTitle}
                  />
                  <input
                    accept=".pdf,.doc,.docx,application/pdf,image/*"
                    onChange={(event) =>
                      setNoteFile(event.target.files?.[0] || null)
                    }
                    required
                    type="file"
                  />
                  <button
                    className="admin-primary-action"
                    disabled={saving}
                    type="submit"
                  >
                    Upload note
                  </button>
                </form>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function formDataFromVideo(file: File) {
  const formData = new FormData();
  formData.append("video", file);
  return formData;
}
