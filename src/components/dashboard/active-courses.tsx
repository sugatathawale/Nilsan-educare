import Image from "next/image";
import { Plus } from "lucide-react";
import { activeCourses } from "@/data/dashboard";
import { SectionHeading } from "@/components/ui/section-heading";

export function ActiveCourses() {
  return (
    <section className="dashboard-section dashboard-section--muted">
      <div className="site-container">
        <SectionHeading controls eyebrow="My Active Courses" title="Continue Learning" />

        <div className="course-grid">
          {activeCourses.map((course) => (
            <article className="course-card" key={course.title}>
              <Image alt={course.title} height={1024} src={course.image} width={1024} />
              <div className="course-card__body">
                <h3>{course.title}</h3>
                <div className="course-card__progress">
                  <div>
                    <span>Progress</span>
                    <strong>{course.progress}%</strong>
                  </div>
                  <div className="progress-track">
                    <i style={{ width: `${course.progress}%` }} />
                  </div>
                </div>
                <p>Classes attended: {course.attended}</p>
                <button type="button">Join Next Class</button>
              </div>
            </article>
          ))}

          <article className="course-card course-card--add">
            <div>
              <Plus size={36} />
              <h3>Add New Course</h3>
              <p>Explore more courses</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
