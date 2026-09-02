import { Star } from "lucide-react";
import { testimonials } from "@/data/dashboard";
import { SectionHeading } from "@/components/ui/section-heading";

export function TestimonialsSection() {
  return (
    <section className="dashboard-section">
      <div className="site-container">
        <SectionHeading controls eyebrow="Student Success Stories" title="What Others Are Achieving" />

        <div className="testimonial-grid">
          {testimonials.map((testimonial) => (
            <article className="testimonial-card" key={`${testimonial.author}-${testimonial.quote}`}>
              <div className="testimonial-card__stars" aria-label={`${testimonial.rating} star rating`}>
                {Array.from({ length: testimonial.rating }).map((_, index) => (
                  <Star fill="currentColor" key={index} size={16} />
                ))}
              </div>
              <p>&quot;{testimonial.quote}&quot;</p>
              <strong>{testimonial.author}</strong>
              <span>{testimonial.role}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
