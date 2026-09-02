import { upcomingClasses } from "@/data/dashboard";
import { SectionHeading } from "@/components/ui/section-heading";

export function UpcomingClasses() {
  return (
    <section className="dashboard-section">
      <div className="site-container">
        <SectionHeading title="Your Upcoming Classes" />

        <div className="class-list">
          {upcomingClasses.map((item) => (
            <article className="class-row" key={`${item.date}-${item.time}-${item.course}`}>
              <div className="class-row__content">
                <div className="class-row__time">
                  <span>{item.date}</span>
                  <strong>{item.time}</strong>
                </div>
                <div>
                  <h3>{item.course}</h3>
                  <p>
                    Trainer: <strong>{item.trainer}</strong> • Duration: {item.duration}
                  </p>
                </div>
              </div>
              <button type="button">Join Class</button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
