"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Clock, MonitorPlay, Star } from "lucide-react";
import { featuredCourse } from "@/data/dashboard";
import { apiRequest, formatPaise, mediaUrl } from "@/lib/api";
import type { CourseSummary } from "@/lib/admin-types";
import { coursePageStatic } from "@/lib/course-page";

type DisplayCourse = {
  slug: string;
  title: string;
  tagline: string;
  badge: string;
  duration: string;
  level: string;
  mode: string;
  image: string;
  price: string;
  originalPrice: string | null;
  remoteImage: boolean;
  stats: typeof coursePageStatic.stats;
  highlights: string[];
};

function toDisplay(course: CourseSummary): DisplayCourse {
  return {
    slug: course.slug,
    title: course.title,
    tagline: course.tagline || featuredCourse.tagline,
    badge: course.badge || featuredCourse.badge,
    duration: course.duration || featuredCourse.duration,
    level: course.level || featuredCourse.level,
    mode: course.mode || featuredCourse.mode,
    image: course.imageUrl ? mediaUrl(course.imageUrl) : featuredCourse.image,
    price: formatPaise(course.pricePaise),
    originalPrice: course.originalPricePaise
      ? formatPaise(course.originalPricePaise)
      : null,
    remoteImage: Boolean(course.imageUrl),
    stats: coursePageStatic.stats,
    highlights: coursePageStatic.highlights
  };
}

const fallbackCourse: DisplayCourse = {
  slug: featuredCourse.slug,
  title: featuredCourse.title,
  tagline: featuredCourse.tagline,
  badge: featuredCourse.badge,
  duration: featuredCourse.duration,
  level: featuredCourse.level,
  mode: featuredCourse.mode,
  image: featuredCourse.image,
  price: featuredCourse.price,
  originalPrice: featuredCourse.originalPrice,
  remoteImage: false,
  stats: featuredCourse.stats,
  highlights: featuredCourse.highlights
};

export function CoursesSection() {
  const [courses, setCourses] = useState<DisplayCourse[]>([fallbackCourse]);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const data = await apiRequest<{ courses: CourseSummary[] }>("/courses");
        if (!alive) return;
        if (data.courses.length > 0) {
          setCourses(data.courses.map(toDisplay));
        }
      } catch {
        // Keep static fallback
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="courses-section" id="courses">
      <div className="site-container">
        <div className="courses-section__heading">
          <div>
            <p className="section-eyebrow">Our Courses</p>
            <h2>One focused program. Real speaking results.</h2>
          </div>
          <p>
            Live 1-on-1 coaching built for students, job seekers, and professionals who want
            confidence — not textbook English.
          </p>
        </div>

        <div className="courses-section__list">
          {courses.map((course) => (
            <article className="course-card-featured" key={course.slug}>
              <div className="course-card-featured__media">
                <Image
                  alt={course.title}
                  fill
                  sizes="(max-width: 900px) 100vw, 46vw"
                  src={course.image}
                  unoptimized={course.remoteImage}
                />
                {course.badge ? (
                  <span className="course-card-featured__badge">{course.badge}</span>
                ) : null}
              </div>

              <div className="course-card-featured__body">
                <div className="course-card-featured__top">
                  <h3>{course.title}</h3>
                  <p>{course.tagline}</p>
                </div>

                <div className="course-card-featured__stats">
                  {course.stats.map((stat) => (
                    <div key={stat.label}>
                      <strong>{stat.value}</strong>
                      <span>{stat.label}</span>
                    </div>
                  ))}
                </div>

                <ul className="course-card-featured__list">
                  {course.highlights.map((item) => (
                    <li key={item}>
                      <Check size={16} strokeWidth={2.5} />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="course-card-featured__meta">
                  <span>
                    <Clock size={15} />
                    {course.duration}
                  </span>
                  <span>
                    <Star size={15} />
                    {course.level}
                  </span>
                  <span>
                    <MonitorPlay size={15} />
                    {course.mode}
                  </span>
                </div>

                <div className="course-card-featured__footer">
                  <div className="course-card-featured__price">
                    <strong>{course.price}</strong>
                    {course.originalPrice ? <span>{course.originalPrice}</span> : null}
                    <small>Limited-time offer</small>
                  </div>
                  <div className="course-card-featured__actions">
                    <Link
                      className="course-card-featured__cta"
                      href={`/courses/${course.slug}`}
                    >
                      View course
                      <ArrowRight size={17} />
                    </Link>
                    <Link className="course-card-featured__ghost" href="/contact">
                      Ask a question
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
