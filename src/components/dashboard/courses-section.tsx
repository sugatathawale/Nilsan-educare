import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Clock, Sparkles, Star, Users } from "lucide-react";
import { featuredCourse } from "@/data/dashboard";

export function CoursesSection() {
  return (
    <section className="courses-section" id="courses">
      <div className="site-container">
        <div className="courses-section__heading">
          <p className="section-eyebrow">Learn With Us</p>
          <h2>Our Course</h2>
          <p>
            One focused program. One clear goal. Speak English confidently with live personal coaching.
          </p>
        </div>

        <article className="course-spotlight">
          <div className="course-spotlight__media">
            <Image
              alt={featuredCourse.title}
              height={520}
              src={featuredCourse.image}
              width={720}
            />
            <span className="course-spotlight__badge">{featuredCourse.badge}</span>
          </div>

          <div className="course-spotlight__content">
            <p className="course-spotlight__eyebrow">
              <Sparkles size={16} />
              Flagship English Program
            </p>
            <h3>{featuredCourse.title}</h3>
            <p className="course-spotlight__tagline">{featuredCourse.tagline}</p>
            <p>{featuredCourse.shortDescription}</p>

            <ul className="course-spotlight__highlights">
              {featuredCourse.highlights.map((item) => (
                <li key={item}>
                  <Check size={18} />
                  {item}
                </li>
              ))}
            </ul>

            <div className="course-spotlight__meta">
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
                1-on-1 Live Classes
              </span>
            </div>

            <div className="course-spotlight__footer">
              <div>
                <strong>{featuredCourse.price}</strong>
                <span>{featuredCourse.originalPrice}</span>
                <small>Limited-time launch offer</small>
              </div>
              <Link
                className="course-spotlight__cta"
                href={`/courses/${featuredCourse.slug}`}
              >
                View Details
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
