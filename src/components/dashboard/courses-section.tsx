import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Clock, MonitorPlay, Star } from "lucide-react";
import { featuredCourse } from "@/data/dashboard";

export function CoursesSection() {
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

        <article className="course-card-featured">
          <div className="course-card-featured__media">
            <Image
              alt={featuredCourse.title}
              fill
              sizes="(max-width: 900px) 100vw, 46vw"
              src={featuredCourse.image}
            />
            <span className="course-card-featured__badge">{featuredCourse.badge}</span>
          </div>

          <div className="course-card-featured__body">
            <div className="course-card-featured__top">
              <h3>{featuredCourse.title}</h3>
              <p>{featuredCourse.tagline}</p>
            </div>

            <div className="course-card-featured__stats">
              {featuredCourse.stats.map((stat) => (
                <div key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>

            <ul className="course-card-featured__list">
              {featuredCourse.highlights.map((item) => (
                <li key={item}>
                  <Check size={16} strokeWidth={2.5} />
                  {item}
                </li>
              ))}
            </ul>

            <div className="course-card-featured__meta">
              <span>
                <Clock size={15} />
                {featuredCourse.duration}
              </span>
              <span>
                <Star size={15} />
                {featuredCourse.level}
              </span>
              <span>
                <MonitorPlay size={15} />
                {featuredCourse.mode}
              </span>
            </div>

            <div className="course-card-featured__footer">
              <div className="course-card-featured__price">
                <strong>{featuredCourse.price}</strong>
                <span>{featuredCourse.originalPrice}</span>
                <small>Limited-time offer</small>
              </div>
              <div className="course-card-featured__actions">
                <Link
                  className="course-card-featured__cta"
                  href={`/courses/${featuredCourse.slug}`}
                >
                  View course
                  <ArrowRight size={17} />
                </Link>
                <Link
                  className="course-card-featured__ghost"
                  href="/contact"
                >
                  Ask a question
                </Link>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
