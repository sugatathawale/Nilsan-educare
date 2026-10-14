"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  Play,
  PlayCircle
} from "lucide-react";
import { useStudentAuth } from "@/components/auth/student-auth-provider";
import { LessonPlayer } from "@/components/courses/lesson-player";
import { apiRequest, mediaUrl, ApiRequestError } from "@/lib/api";
import type { CourseSummary, LessonItem } from "@/lib/admin-types";

function CoursePlayerInner() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useStudentAuth();

  const slug = params.slug;
  const lessonFromQuery = searchParams.get("lesson");

  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?next=/my-learning/${slug}`);
    }
  }, [authLoading, user, router, slug]);

  useEffect(() => {
    if (!user || !slug) return;

    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [lessonsData, courseData] = await Promise.all([
          apiRequest<{ lessons: LessonItem[] }>(`/lessons/course/${slug}`),
          apiRequest<{ course: CourseSummary }>(`/courses/${slug}`).catch(
            () => null
          )
        ]);
        if (!active) return;

        setLessons(lessonsData.lessons);
        setCourseTitle(courseData?.course.title || slug);

        const preferred =
          lessonsData.lessons.find((lesson) => lesson.id === lessonFromQuery) ||
          lessonsData.lessons[0] ||
          null;
        setActiveLessonId(preferred?.id ?? null);
      } catch (err) {
        if (!active) return;
        const message =
          err instanceof ApiRequestError || err instanceof Error
            ? err.message
            : "Failed to load lessons";
        setError(message);
        setLessons([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [user, slug, lessonFromQuery]);

  const activeLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === activeLessonId) || null,
    [lessons, activeLessonId]
  );

  const activeIndex = useMemo(
    () => lessons.findIndex((lesson) => lesson.id === activeLessonId),
    [lessons, activeLessonId]
  );

  const embedUrl = activeLesson?.embedUrl || activeLesson?.videoUrl || null;
  const hasVideo = Boolean(embedUrl);
  const notes = activeLesson?.notes || [];

  function selectLesson(lessonId: string) {
    setActiveLessonId(lessonId);
    router.replace(`/my-learning/${slug}?lesson=${lessonId}`, {
      scroll: false
    });
  }

  if (authLoading || !user) {
    return (
      <div className="learn-shell">
        <p className="admin-state">Loading your account...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="learn-shell course-player">
        <header className="course-player__topbar">
          <Link className="course-player__back" href="/my-learning">
            <ArrowLeft size={16} />
            My Learning
          </Link>
          <h1>{courseTitle || "Loading course…"}</h1>
          <p>Fetching your lectures</p>
        </header>
        <div className="course-player__skeleton" aria-hidden>
          <div className="course-player__skeleton-stage" />
          <div className="course-player__skeleton-side" />
        </div>
      </div>
    );
  }

  return (
    <div className="learn-shell course-player">
      <header className="course-player__topbar">
        <div>
          <Link className="course-player__back" href="/my-learning">
            <ArrowLeft size={16} />
            My Learning
          </Link>
          <h1>{courseTitle || "Course lessons"}</h1>
          <p>
            {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
            {activeIndex >= 0
              ? ` · Now playing ${activeIndex + 1} of ${lessons.length}`
              : ""}
          </p>
        </div>
      </header>

      {error ? <p className="admin-state admin-state--error">{error}</p> : null}

      {!error && lessons.length === 0 ? (
        <div className="learn-empty">
          <PlayCircle size={32} />
          <h3>No lessons yet</h3>
          <p>Lessons will appear here once they are added to this course.</p>
        </div>
      ) : null}

      {!error && lessons.length > 0 ? (
        <div className="course-player__layout">
          <section className="course-player__main">
            {activeLesson ? (
              <>
                <div className="course-player__stage">
                  {hasVideo ? (
                    <LessonPlayer
                      embedUrl={embedUrl!}
                      title={activeLesson.title}
                    />
                  ) : (
                    <div className="course-player__empty-video">
                      <PlayCircle size={36} />
                      <p>No video attached to this lesson yet.</p>
                    </div>
                  )}
                </div>

                <div className="course-player__meta">
                  <div className="course-player__meta-row">
                    <span className="learn-badge">
                      Lesson {activeLesson.order}
                    </span>
                    {activeLesson.duration ? (
                      <span className="course-player__chip">
                        <Clock3 size={14} />
                        {activeLesson.duration}
                      </span>
                    ) : null}
                    {hasVideo ? (
                      <span className="course-player__chip course-player__chip--ok">
                        <CheckCircle2 size={14} />
                        Ready to watch
                      </span>
                    ) : null}
                  </div>
                  <h2>{activeLesson.title}</h2>
                </div>

                <div className="course-player__notes">
                  <div className="course-player__notes-head">
                    <FileText size={18} />
                    <strong>Lecture notes</strong>
                    <span>{notes.length}</span>
                  </div>
                  {notes.length > 0 ? (
                    <ul>
                      {notes.map((note) => (
                        <li key={note.id}>
                          <a
                            href={mediaUrl(note.fileUrl)}
                            rel="noreferrer"
                            target="_blank"
                          >
                            <FileText size={16} />
                            <span>{note.title}</span>
                            <ChevronLabel />
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="course-player__notes-empty">
                      No notes for this lesson yet.
                    </p>
                  )}
                </div>
              </>
            ) : null}
          </section>

          <aside className="course-player__sidebar">
            <div className="course-player__sidebar-head">
              <strong>Lessons</strong>
              <span>{lessons.length}</span>
            </div>
            <ul className="course-player__list">
              {lessons.map((lesson) => {
                const isActive = lesson.id === activeLessonId;
                const lessonHasVideo = Boolean(
                  lesson.embedUrl || lesson.videoUrl
                );
                return (
                  <li key={lesson.id}>
                    <button
                      className={
                        isActive
                          ? "course-player__item is-active"
                          : "course-player__item"
                      }
                      onClick={() => selectLesson(lesson.id)}
                      type="button"
                    >
                      <span
                        className={
                          isActive
                            ? "course-player__index is-active"
                            : "course-player__index"
                        }
                      >
                        {isActive ? <Play size={12} fill="currentColor" /> : lesson.order}
                      </span>
                      <span className="course-player__item-copy">
                        <strong>{lesson.title}</strong>
                        <small>
                          {lesson.duration || "No duration"}
                          {lessonHasVideo ? " · Video" : " · Coming soon"}
                        </small>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function ChevronLabel() {
  return <span className="course-player__note-open">Open</span>;
}

export default function CoursePlayerPage() {
  return (
    <Suspense
      fallback={
        <div className="learn-shell">
          <p className="admin-state">Loading player...</p>
        </div>
      }
    >
      <CoursePlayerInner />
    </Suspense>
  );
}
