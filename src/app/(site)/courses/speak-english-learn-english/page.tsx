import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen, Check, Clock, Star, Target, Users } from "lucide-react";
import { BrochureDownload } from "@/components/courses/brochure-download";
import { featuredCourse } from "@/data/dashboard";

export default function CourseDetailsPage() {
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
              <span className="course-details__badge">{featuredCourse.badge}</span>
              <h1>{featuredCourse.title}</h1>
              <p className="course-details__tagline">{featuredCourse.tagline}</p>
              <p>{featuredCourse.longDescription}</p>

              <div className="course-details__meta">
                <span>
                  <Clock size={16} />
                  {featuredCourse.duration}
                </span>
                <span>
                  <Star size={16} />
                  {featuredCourse.level}
                </span>
                <span>
                  <Users size={16} />
                  {featuredCourse.mode}
                </span>
                <span>
                  <BookOpen size={16} />
                  {featuredCourse.classLength}
                </span>
              </div>

              <div className="course-details__actions">
                <div className="course-details__price">
                  <strong>{featuredCourse.price}</strong>
                  <span>{featuredCourse.originalPrice}</span>
                  <small>Limited-time offer</small>
                </div>
                <div className="course-details__buttons">
                  <button className="course-details__enroll" type="button">
                    Enrol Now
                  </button>
                  <BrochureDownload />
                </div>
              </div>
            </div>

            <div className="course-details__hero-media">
              <Image
                alt={featuredCourse.title}
                height={520}
                priority
                src={featuredCourse.image}
                width={720}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="course-details__stats">
        <div className="site-container course-details__stats-grid">
          {featuredCourse.stats.map((stat) => (
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
            {featuredCourse.highlights.map((item) => (
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
              {featuredCourse.audience.map((item) => (
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
              {featuredCourse.outcomes.map((item) => (
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
            {featuredCourse.structuredPlan.map((week) => (
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
            {featuredCourse.includes.map((item) => (
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
            {featuredCourse.faqs.map((faq) => (
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
              Join the {featuredCourse.title} program today or download the full brochure with the
              complete structured plan.
            </p>
          </div>
          <div className="course-details__cta-actions">
            <button className="course-details__enroll" type="button">
              Enrol Now — {featuredCourse.price}
            </button>
            <BrochureDownload />
          </div>
        </section>
      </div>
    </div>
  );
}
