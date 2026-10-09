"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Clock,
  Star,
  Target,
  Users
} from "lucide-react";
import { BrochureDownload } from "@/components/courses/brochure-download";
import { EnrollButton } from "@/components/courses/enroll-button";
import { apiRequest } from "@/lib/api";
import type { CourseSummary } from "@/lib/admin-types";
import {
  coursePageStatic,
  mapCourseToHero,
  type CoursePageHero
} from "@/lib/course-page";

function CourseDetailsInner() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [course, setCourse] = useState<CoursePageHero | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest<{ course: CourseSummary }>(
          `/courses/${slug}`
        );
        if (alive) setCourse(mapCourseToHero(data.course));
      } catch (err) {
        if (alive) {
          setError(err instanceof Error ? err.message : "Course not found");
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    if (slug) void load();
    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="course-details">
        <div className="site-container" style={{ padding: "48px 0" }}>
          <p className="admin-state">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="course-details">
        <div className="site-container" style={{ padding: "48px 0" }}>
          <p className="admin-state admin-state--error">
            {error || "Course not found"}
          </p>
          <Link className="course-details__back" href="/dashboard#courses">
            <ArrowLeft size={18} />
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const remoteImage = course.image.startsWith("http");

  return (
    <div className="course-details">
      <section className="course-details__banner">
        <div className="site-container">
          <Link className="course-details__back" href="/dashboard#courses">
            <ArrowLeft size={18} />
            Back to Courses
          </Link>

          <div className="course-details__hero">
            <div className="course-details__hero-copy">
              {course.badge ? (
                <span className="course-details__badge">{course.badge}</span>
              ) : null}
              <h1>{course.title}</h1>
              <p className="course-details__tagline">{course.tagline}</p>
              <p>{course.description}</p>

              <div className="course-details__meta">
                {course.duration ? (
                  <span>
                    <Clock size={16} />
                    {course.duration}
                  </span>
                ) : null}
                {course.level ? (
                  <span>
                    <Star size={16} />
                    {course.level}
                  </span>
                ) : null}
                {course.mode ? (
                  <span>
                    <Users size={16} />
                    {course.mode}
                  </span>
                ) : null}
                {course.classLength ? (
                  <span>
                    <BookOpen size={16} />
                    {course.classLength}
                  </span>
                ) : null}
              </div>

              <div className="course-details__actions">
                <div className="course-details__price">
                  <strong>{course.price}</strong>
                  {course.originalPrice ? <span>{course.originalPrice}</span> : null}
                  <small>Limited-time offer</small>
                </div>
                <div className="course-details__buttons">
                  <EnrollButton courseSlug={course.slug} label="Enrol Now" />
                  <BrochureDownload />
                </div>
              </div>
            </div>

            <div className="course-details__hero-media">
              <Image
                alt={course.title}
                height={520}
                priority
                src={course.image}
                unoptimized={remoteImage}
                width={720}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="course-details__stats">
        <div className="site-container course-details__stats-grid">
          {coursePageStatic.stats.map((stat) => (
            <article key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </div>
      </section>

      <div className="site-container course-details__body">
        <section className="course-details__section">
          <div className="course-details__section-head">
            <p className="section-eyebrow">Program Overview</p>
            <h2>Why This Course Works</h2>
          </div>
          <div className="course-details__highlight-grid">
            {coursePageStatic.highlights.map((item) => (
              <article className="course-details__highlight" key={item}>
                <Check size={18} />
                <p>{item}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="course-details__grid">
          <article className="course-details__card">
            <div className="course-details__section-head">
              <p className="section-eyebrow">Audience</p>
              <h2>Who Should Join</h2>
            </div>
            <ul>
              {coursePageStatic.audience.map((item) => (
                <li key={item}>
                  <Target size={18} />
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="course-details__card">
            <div className="course-details__section-head">
              <p className="section-eyebrow">Outcomes</p>
              <h2>What You Will Learn</h2>
            </div>
            <ul>
              {coursePageStatic.outcomes.map((item) => (
                <li key={item}>
                  <Check size={18} />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="course-details__section course-details__plan">
          <div className="course-details__section-head course-details__section-head--row">
            <div>
              <p className="section-eyebrow">Structured Plan</p>
              <h2>4-Week Learning Roadmap</h2>
              <p>A clear week-by-week plan so you know exactly what you will learn.</p>
            </div>
            <BrochureDownload />
          </div>

          <div className="course-details__plan-grid">
            {coursePageStatic.structuredPlan.map((week) => (
              <article className="course-details__plan-card" key={week.week}>
                <div className="course-details__plan-top">
                  <span>{week.week}</span>
                  <strong>{week.title}</strong>
                  <p>{week.focus}</p>
                </div>
                <ul>
                  {week.topics.map((topic) => (
                    <li key={topic}>
                      <Check size={16} />
                      {topic}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="course-details__section">
          <div className="course-details__section-head">
            <p className="section-eyebrow">Inclusions</p>
            <h2>What Is Included</h2>
          </div>
          <div className="course-details__includes-grid">
            {coursePageStatic.includes.map((item) => (
              <article className="course-details__include" key={item}>
                <Check size={18} />
                <span>{item}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="course-details__section">
          <div className="course-details__section-head">
            <p className="section-eyebrow">FAQ</p>
            <h2>Common Questions</h2>
          </div>
          <div className="course-details__faq-grid">
            {coursePageStatic.faqs.map((faq) => (
              <article className="course-details__faq" key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="course-details__cta">
          <div>
            <p className="section-eyebrow">Start Learning</p>
            <h2>Ready to Speak English Confidently?</h2>
            <p>
              Join the {course.title} program today or download the full brochure with the
              complete structured plan.
            </p>
          </div>
          <div className="course-details__cta-actions">
            <EnrollButton
              courseSlug={course.slug}
              label={`Enrol Now — ${course.price}`}
            />
            <BrochureDownload />
          </div>
        </section>
      </div>
    </div>
  );
}

export default function CourseDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="course-details">
          <div className="site-container" style={{ padding: "48px 0" }}>
            <p className="admin-state">Loading course...</p>
          </div>
        </div>
      }
    >
      <CourseDetailsInner />
    </Suspense>
  );
}
