import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { featuredCourse } from "@/data/dashboard";

export function ExploreCourses() {
  return (
    <section className="explore-section">
      <div className="site-container explore-section__inner">
        <h2>Ready to Start Speaking?</h2>
        <p>
          Join our flagship {featuredCourse.title} program and build real confidence with live
          1-on-1 classes.
        </p>
        <Link className="explore-section__link" href={`/courses/${featuredCourse.slug}`}>
          View Details
          <ArrowRight size={20} />
        </Link>
      </div>
    </section>
  );
}
