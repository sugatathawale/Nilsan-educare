import Image from "next/image";
import { Check } from "lucide-react";
import { heroFeatures } from "@/data/dashboard";
import { ResultsMarquee } from "@/components/dashboard/results-marquee";

export function DashboardHero() {
  return (
    <section className="dashboard-hero">
      <div className="site-container dashboard-hero__grid">
        <div className="dashboard-hero__copy">
          <h1>
            <span className="dashboard-hero__title-line">Welcome Back,</span>
            <span className="dashboard-hero__title-accent">Student!</span>
          </h1>
          <p>Continue your English learning journey with personalized 1-on-1 classes.</p>

          <ul>
            {heroFeatures.map((feature) => (
              <li key={feature}>
                <Check size={34} />
                {feature}
              </li>
            ))}
          </ul>

          <div className="dashboard-hero__actions">
            <button type="button">Enrol in New Course</button>
            <strong>Starting from ₹1,799</strong>
          </div>
        </div>

        <div className="dashboard-hero__visual">
          <Image
            alt="Teacher"
            className="dashboard-hero__teacher"
            height={1024}
            priority
            sizes="(max-width: 900px) 90vw, 520px"
            src="/images/nilesteacher.png"
            width={1536}
          />
        </div>
      </div>

      <ResultsMarquee />
    </section>
  );
}
