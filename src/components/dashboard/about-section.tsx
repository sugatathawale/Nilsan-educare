import { Award, BookOpen, Target, Users } from "lucide-react";

const aboutPoints = [
  {
    icon: Users,
    title: "Expert Trainers",
    text: "Learn from experienced Indian trainers with global teaching standards."
  },
  {
    icon: BookOpen,
    title: "Personalized Learning",
    text: "1-on-1 live classes tailored to your goals, pace, and schedule."
  },
  {
    icon: Target,
    title: "Clear Progress",
    text: "Track attendance, quiz scores, and fluency growth in one place."
  },
  {
    icon: Award,
    title: "Proven Results",
    text: "Students improve speaking confidence for school, work, and interviews."
  }
];

export function AboutSection() {
  return (
    <section className="about-section" id="about">
      <div className="site-container">
        <div className="about-section__heading">
          <p className="section-eyebrow">Who We Are</p>
          <h2>About Us</h2>
          <p>
            Nilsan Educare helps students build strong English communication through live classes,
            practical practice, and continuous feedback from expert trainers.
          </p>
        </div>

        <div className="about-section__grid">
          {aboutPoints.map((point) => {
            const Icon = point.icon;

            return (
              <article className="about-card" key={point.title}>
                <span>
                  <Icon size={22} />
                </span>
                <h3>{point.title}</h3>
                <p>{point.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
