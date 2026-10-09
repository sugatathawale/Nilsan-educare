"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Pencil, PlayCircle, Plus, Trash2 } from "lucide-react";
import { AdminStatus } from "@/components/admin/admin-status";
import {
  apiRequest,
  apiUpload,
  formatPaise,
  mediaUrl,
  ApiRequestError
} from "@/lib/api";
import type { CourseSummary, EnrollmentRow } from "@/lib/admin-types";

const emptyForm = {
  title: "",
  slug: "",
  tagline: "",
  description: "",
  badge: "Most Popular Program",
  duration: "12 live classes",
  level: "Beginner to Intermediate",
  mode: "Online • 1-on-1 Live",
  classLength: "45–60 minutes per session",
  priceRupees: "1799",
  originalPriceRupees: "2999",
  isActive: true
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [coursesData, enrollmentsData] = await Promise.all([
        apiRequest<{ courses: CourseSummary[] }>("/courses?all=1"),
        apiRequest<{ enrollments: EnrollmentRow[] }>("/enrollments")
      ]);
      setCourses(coursesData.courses);
      setEnrollments(enrollmentsData.enrollments);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const enrollmentCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const enrollment of enrollments) {
      if (enrollment.status !== "PAID") continue;
      map.set(
        enrollment.course.slug,
        (map.get(enrollment.course.slug) || 0) + 1
      );
    }
    return map;
  }, [enrollments]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setImage(null);
    setSlugTouched(false);
  }

  function startEdit(course: CourseSummary) {
    setEditingId(course.id);
    setSlugTouched(true);
    setImage(null);
    setForm({
      title: course.title,
      slug: course.slug,
      tagline: course.tagline || "",
      description: course.description || "",
      badge: course.badge || "",
      duration: course.duration || "",
      level: course.level || "",
      mode: course.mode || "",
      classLength: course.classLength || "",
      priceRupees: String(Math.round(course.pricePaise / 100)),
      originalPriceRupees: course.originalPricePaise
        ? String(Math.round(course.originalPricePaise / 100))
        : "",
      isActive: course.isActive
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("slug", form.slug.trim() || slugify(form.title));
      formData.append("tagline", form.tagline.trim());
      formData.append("description", form.description.trim());
      formData.append("badge", form.badge.trim());
      formData.append("duration", form.duration.trim());
      formData.append("level", form.level.trim());
      formData.append("mode", form.mode.trim());
      formData.append("classLength", form.classLength.trim());
      formData.append(
        "pricePaise",
        String(Math.round(Number(form.priceRupees) * 100))
      );
      if (form.originalPriceRupees.trim()) {
        formData.append(
          "originalPricePaise",
          String(Math.round(Number(form.originalPriceRupees) * 100))
        );
      }
      formData.append("isActive", String(form.isActive));
      if (image) formData.append("image", image);

      if (editingId) {
        await apiUpload<{ course: CourseSummary }>(
          `/courses/${editingId}`,
          formData,
          "PATCH"
        );
        setMessage("Course updated.");
      } else {
        await apiUpload<{ course: CourseSummary }>("/courses", formData);
        setMessage("Course created.");
      }

      resetForm();
      await load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError || err instanceof Error
          ? err.message
          : "Failed to save course"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(course: CourseSummary) {
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) {
      return;
    }
    setError("");
    setMessage("");
    try {
      await apiRequest(`/courses/${course.id}`, { method: "DELETE" });
      setMessage("Course deleted.");
      if (editingId === course.id) resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete course");
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="admin-eyebrow">Courses</p>
          <h1>Course Catalog</h1>
          <p>
            Add course details shown on the course page hero. Plan, FAQ, and
            other sections stay static on the site.
          </p>
        </div>
        <Link className="admin-primary-action" href="/admin/lessons">
          <PlayCircle size={18} />
          Manage Lessons
        </Link>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form__row">
          <label>
            Title *
            <input
              onChange={(e) => {
                const title = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  title,
                  slug: slugTouched ? prev.slug : slugify(title)
                }));
              }}
              required
              value={form.title}
            />
          </label>
          <label>
            Slug *
            <input
              onChange={(e) => {
                setSlugTouched(true);
                setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }));
              }}
              required
              value={form.slug}
            />
          </label>
        </div>

        <label>
          Tagline
          <input
            onChange={(e) => setForm((prev) => ({ ...prev, tagline: e.target.value }))}
            placeholder="Short line under the title"
            value={form.tagline}
          />
        </label>

        <label>
          Description
          <textarea
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Main course description"
            rows={4}
            value={form.description}
          />
        </label>

        <div className="admin-form__row">
          <label>
            Badge
            <input
              onChange={(e) => setForm((prev) => ({ ...prev, badge: e.target.value }))}
              value={form.badge}
            />
          </label>
          <label>
            Duration
            <input
              onChange={(e) =>
                setForm((prev) => ({ ...prev, duration: e.target.value }))
              }
              value={form.duration}
            />
          </label>
        </div>

        <div className="admin-form__row">
          <label>
            Level
            <input
              onChange={(e) => setForm((prev) => ({ ...prev, level: e.target.value }))}
              value={form.level}
            />
          </label>
          <label>
            Mode
            <input
              onChange={(e) => setForm((prev) => ({ ...prev, mode: e.target.value }))}
              value={form.mode}
            />
          </label>
        </div>

        <div className="admin-form__row">
          <label>
            Class length
            <input
              onChange={(e) =>
                setForm((prev) => ({ ...prev, classLength: e.target.value }))
              }
              value={form.classLength}
            />
          </label>
          <label>
            Cover image
            <input
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              type="file"
            />
          </label>
        </div>

        <div className="admin-form__row">
          <label>
            Price (₹) *
            <input
              min="0"
              onChange={(e) =>
                setForm((prev) => ({ ...prev, priceRupees: e.target.value }))
              }
              required
              type="number"
              value={form.priceRupees}
            />
          </label>
          <label>
            Original price (₹)
            <input
              min="0"
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  originalPriceRupees: e.target.value
                }))
              }
              type="number"
              value={form.originalPriceRupees}
            />
          </label>
        </div>

        <div className="admin-form__options">
          <label>
            <input
              checked={form.isActive}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isActive: e.target.checked }))
              }
              type="checkbox"
            />
            Active (visible on site)
          </label>
        </div>

        <div className="admin-form__actions">
          <button className="admin-primary-action" disabled={saving} type="submit">
            {editingId ? <Pencil size={16} /> : <Plus size={16} />}
            {saving
              ? "Saving..."
              : editingId
                ? "Update course"
                : "Add course"}
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
      {loading ? <p className="admin-state">Loading courses...</p> : null}
      {error ? <p className="admin-state admin-state--error">{error}</p> : null}

      {!loading && !error && courses.length === 0 ? (
        <p className="admin-empty">No courses yet. Add the first one above.</p>
      ) : null}

      {!loading && courses.length > 0 ? (
        <div className="admin-course-cards">
          {courses.map((course) => (
            <article className="admin-course-card" key={course.id}>
              <div className="admin-course-card__top">
                <div>
                  <strong>{course.title}</strong>
                  <span>/{course.slug}</span>
                </div>
                <AdminStatus status={course.isActive ? "Active" : "Draft"} />
              </div>

              {course.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt=""
                  className="admin-course-card__thumb"
                  src={mediaUrl(course.imageUrl)}
                />
              ) : null}

              {course.tagline || course.description ? (
                <p className="admin-course-card__desc">
                  {course.tagline || course.description}
                </p>
              ) : null}

              <div className="admin-course-card__stats">
                <div>
                  <b>{formatPaise(course.pricePaise)}</b>
                  <span>Price</span>
                </div>
                <div>
                  <b>{course._count.lessons}</b>
                  <span>Lessons</span>
                </div>
                <div>
                  <b>{enrollmentCounts.get(course.slug) || 0}</b>
                  <span>Paid students</span>
                </div>
              </div>

              <div className="admin-form__actions">
                <button
                  className="admin-secondary-action"
                  onClick={() => startEdit(course)}
                  type="button"
                >
                  <Pencil size={16} />
                  Edit
                </button>
                <Link
                  className="admin-secondary-action"
                  href={`/admin/lessons?course=${course.slug}`}
                >
                  Manage lessons
                </Link>
                <Link
                  className="admin-secondary-action"
                  href={`/courses/${course.slug}`}
                  target="_blank"
                >
                  View page
                </Link>
                <button
                  className="admin-secondary-action"
                  onClick={() => void handleDelete(course)}
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
