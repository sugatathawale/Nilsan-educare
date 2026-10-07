"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { apiRequest, ApiRequestError } from "@/lib/api";
import type { CourseSummary, LessonItem } from "@/lib/admin-types";

export default function AdminLessonsClient() {
  const searchParams = useSearchParams();
  const presetCourse = searchParams.get("course") || "";

  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [courseSlug, setCourseSlug] = useState(presetCourse);
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [showForm, setShowForm] = useState(Boolean(presetCourse));
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState("1");
  const [duration, setDuration] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadCourses() {
      try {
        const data = await apiRequest<{ courses: CourseSummary[] }>("/courses");
        if (!active) return;
        setCourses(data.courses);
        setCourseSlug((current) => current || data.courses[0]?.slug || "");
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

    try {
      const payload: Record<string, string | number> = {
        courseSlug,
        title: title.trim(),
        order: Number(order)
      };

      if (duration.trim()) payload.duration = duration.trim();
      if (videoUrl.trim()) payload.videoUrl = videoUrl.trim();
      if (videoId.trim()) payload.videoId = videoId.trim();

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
      setVideoUrl("");
      setVideoId("");
      setShowForm(false);
      setMessage("Lesson created successfully.");
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Failed to create lesson"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this lesson?")) return;

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

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-eyebrow">Lessons</p>
          <h1>Lesson Management</h1>
          <p>Add video lessons to a course and keep the syllabus in order.</p>
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
              Video ID
              <input
                onChange={(event) => setVideoId(event.target.value)}
                placeholder="Bunny / provider video id"
                type="text"
                value={videoId}
              />
            </label>
          </div>

          <label>
            Video URL
            <input
              onChange={(event) => setVideoUrl(event.target.value)}
              placeholder="https://..."
              type="url"
              value={videoUrl}
            />
          </label>

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
        <div className="admin-table admin-table--lessons" role="table">
          <div className="admin-table__head" role="row">
            <span>Order</span>
            <span>Title</span>
            <span>Duration</span>
            <span>Video</span>
            <span>Actions</span>
          </div>
          {lessons.map((lesson) => (
            <div className="admin-table__row" role="row" key={lesson.id}>
              <span>{lesson.order}</span>
              <span>
                <strong>{lesson.title}</strong>
              </span>
              <span>{lesson.duration || "—"}</span>
              <span>
                {lesson.videoUrl || lesson.videoId ? (
                  <small>
                    {lesson.videoId ? `ID: ${lesson.videoId}` : null}
                    {lesson.videoId && lesson.videoUrl ? " · " : null}
                    {lesson.videoUrl ? "URL set" : null}
                  </small>
                ) : (
                  <small>No video</small>
                )}
              </span>
              <span>
                <button
                  className="admin-danger-action"
                  onClick={() => void handleDelete(lesson.id)}
                  type="button"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
