import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { featuredCourse } from "@/data/dashboard";

export function ExploreCourses() {
  return (
    <section className="explore-section">
      <div className="site-container explore-section__inner">
        <div>
          <h2>Ready to start speaking?</h2>
          <p>
            Join {featuredCourse.title} and build confidence with live 1-on-1 classes.
          </p>
        </div>
        <Link className="explore-section__link" href={`/courses/${featuredCourse.slug}`}>
          View course details
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
