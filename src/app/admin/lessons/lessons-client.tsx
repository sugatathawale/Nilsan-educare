"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FileText, Plus, Trash2, Upload } from "lucide-react";
import { apiRequest, apiUpload, mediaUrl, ApiRequestError } from "@/lib/api";
import type {
  BunnyVideoConfig,
  CourseSummary,
  LessonItem
} from "@/lib/admin-types";

export default function AdminLessonsClient() {
  const searchParams = useSearchParams();
  const presetCourse = searchParams.get("course") || "";

  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [courseSlug, setCourseSlug] = useState(presetCourse);
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [bunny, setBunny] = useState<BunnyVideoConfig | null>(null);
  const [showForm, setShowForm] = useState(Boolean(presetCourse));
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState("1");
  const [duration, setDuration] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [manualVideoId, setManualVideoId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [noteLessonId, setNoteLessonId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteFile, setNoteFile] = useState<File | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCourses() {
      try {
        const [coursesData, bunnyData] = await Promise.all([
          apiRequest<{ courses: CourseSummary[] }>("/courses"),
          apiRequest<BunnyVideoConfig>("/lessons/video-config")
        ]);
        if (!active) return;
        setCourses(coursesData.courses);
        setBunny(bunnyData);
        setCourseSlug((current) => current || coursesData.courses[0]?.slug || "");
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load courses");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadCourses();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!courseSlug) {
      setLessons([]);
      return;
    }

    let active = true;

    async function loadLessons() {
      try {
        const data = await apiRequest<{ lessons: LessonItem[] }>(
          `/lessons/course/${courseSlug}`
        );
        if (!active) return;
        setLessons(data.lessons);
        const nextOrder =
          data.lessons.reduce((max, lesson) => Math.max(max, lesson.order), 0) +
          1;
        setOrder(String(nextOrder));
        setError("");
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load lessons");
          setLessons([]);
        }
      }
    }

    void loadLessons();
    return () => {
      active = false;
    };
  }, [courseSlug]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);
    setUploadProgress("");

    try {
      let videoId = manualVideoId.trim() || undefined;
      let videoUrl: string | undefined;

      if (videoFile) {
        if (!bunny?.configured) {
          throw new Error(
            "Bunny Stream is not configured. Add keys in backend/.env first."
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
        const formData = new FormData();
        formData.append("video", videoFile);
        const uploaded = await apiUpload<{
          videoId: string;
          embedUrl: string;
        }>(`/lessons/videos/${videoId}/upload`, formData);

        videoUrl = uploaded.embedUrl;
        setUploadProgress("Saving lesson...");
      }

      const payload: Record<string, string | number> = {
        courseSlug,
        title: title.trim(),
        order: Number(order)
      };

      if (duration.trim()) payload.duration = duration.trim();
      if (videoId) payload.videoId = videoId;
      if (videoUrl) payload.videoUrl = videoUrl;

      await apiRequest<{ lesson: LessonItem }>("/lessons", {
        method: "POST",
        body: payload
      });

      const data = await apiRequest<{ lessons: LessonItem[] }>(
        `/lessons/course/${courseSlug}`
      );
      setLessons(data.lessons);
      setTitle("");
      setDuration("");
      setVideoFile(null);
      setManualVideoId("");
      setShowForm(false);
      setUploadProgress("");
      setMessage(
        videoFile
          ? "Lesson saved. Bunny may take a few minutes to finish encoding the video."
          : "Lesson created successfully."
      );
    } catch (err) {
      setUploadProgress("");
      setError(
        err instanceof ApiRequestError || err instanceof Error
          ? err.message
          : "Failed to create lesson"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this lesson and its Bunny video (if any)?")) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await apiRequest<null>(`/lessons/${id}`, { method: "DELETE" });
      setLessons((prev) => prev.filter((lesson) => lesson.id !== id));
      setMessage("Lesson deleted.");
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Failed to delete lesson"
      );
    }
  }

  async function handleNoteUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!noteLessonId || !noteFile) {
      setError("Choose a lesson note file.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", noteFile);
      if (noteTitle.trim()) formData.append("title", noteTitle.trim());
      await apiUpload(`/lessons/${noteLessonId}/notes`, formData);

      const data = await apiRequest<{ lessons: LessonItem[] }>(
        `/lessons/course/${courseSlug}`
      );
      setLessons(data.lessons);
      setNoteFile(null);
      setNoteTitle("");
      setNoteLessonId(null);
      setMessage("Lecture note uploaded.");
    } catch (err) {
      setError(
        err instanceof ApiRequestError || err instanceof Error
          ? err.message
          : "Failed to upload note"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteNote(noteId: string) {
    if (!window.confirm("Delete this lecture note?")) return;
    try {
      await apiRequest<null>(`/lessons/notes/${noteId}`, { method: "DELETE" });
      setLessons((prev) =>
        prev.map((lesson) => ({
          ...lesson,
          notes: (lesson.notes || []).filter((note) => note.id !== noteId)
        }))
      );
      setMessage("Lecture note deleted.");
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Failed to delete note"
      );
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-eyebrow">Lessons</p>
          <h1>Lesson Management</h1>
          <p>Upload videos to Bunny Stream and attach them to courses.</p>
        </div>
        <button
          className="admin-primary-action"
          disabled={!courseSlug}
          onClick={() => {
            setShowForm((value) => !value);
            setMessage("");
            setError("");
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
            onChange={(event) => setCourseSlug(event.target.value)}
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
        <form className="admin-form" onSubmit={handleCreate}>
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

          <label className="admin-file-field">
            <span>
              <Upload size={18} />
              Upload lecture video
            </span>
            <input
              accept="video/*"
              onChange={(event) => setVideoFile(event.target.files?.[0] || null)}
              type="file"
            />
            <small>
              {videoFile
                ? `${videoFile.name} (${Math.round(videoFile.size / (1024 * 1024))} MB)`
                : "MP4 / MOV up to 500 MB. Stored on Bunny Stream, not in Neon."}
            </small>
          </label>

          {uploadProgress ? (
            <p className="admin-flash">{uploadProgress}</p>
          ) : null}

          <div className="admin-form__actions">
            <button
              className="admin-secondary-action"
              onClick={() => setShowForm(false)}
              type="button"
            >
              Cancel
            </button>
            <button className="admin-primary-action" disabled={saving} type="submit">
              {saving ? "Saving..." : "Save lesson"}
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
                    {lesson.videoId || lesson.videoUrl ? "Video ready" : "No video"}
                  </span>
                </div>
                <div className="admin-lesson-card__actions">
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
                      <a href={mediaUrl(note.fileUrl)} rel="noreferrer" target="_blank">
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
