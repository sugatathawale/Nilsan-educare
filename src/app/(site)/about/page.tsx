import Image from "next/image";
import { Check, Star } from "lucide-react";
import { resultImages, teacherProfile, testimonials } from "@/data/dashboard";

export default function AboutPage() {
  return (
    <div className="about-page">
      <section className="about-page__hero">
        <div className="site-container about-page__hero-grid">
          <div className="about-page__copy">
            <p className="section-eyebrow">About The Trainer</p>
            <h1>{teacherProfile.name}</h1>
            <p className="about-page__role">{teacherProfile.role}</p>
            <p className="about-page__experience">{teacherProfile.experience}</p>

            {teacherProfile.bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}

            <ul className="about-page__highlights">
              {teacherProfile.highlights.map((item) => (
                <li key={item}>
                  <Check size={18} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="about-page__visual">
            <Image
              alt={teacherProfile.name}
              className="about-page__teacher"
              height={1024}
              priority
              src={teacherProfile.image}
              width={1536}
            />
          </div>
        </div>
      </section>

      <section className="about-page__results">
        <div className="site-container">
          <div className="about-page__section-heading">
            <p className="section-eyebrow">Our Result</p>
            <h2>Student Results</h2>
            <p>Real classroom moments and learning outcomes from our students.</p>
          </div>

          <div className="about-page__results-grid">
            {resultImages.map((image) => (
              <div className="about-page__result-card" key={image.src}>
                <Image alt={image.alt} height={280} src={image.src} width={420} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-page__reviews">
        <div className="site-container">
          <div className="about-page__section-heading">
            <p className="section-eyebrow">Reviews</p>
            <h2>What Students Say</h2>
            <p>Feedback from students who improved their English with us.</p>
          </div>

          <div className="about-page__reviews-grid">
            {testimonials.map((review) => (
              <article className="about-page__review-card" key={`${review.author}-${review.quote}`}>
                <div className="about-page__stars" aria-label={`${review.rating} star rating`}>
                  {Array.from({ length: review.rating }).map((_, index) => (
                    <Star fill="currentColor" key={index} size={16} />
                  ))}
                </div>
                <p>&quot;{review.quote}&quot;</p>
                <strong>{review.author}</strong>
                <span>{review.role}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
