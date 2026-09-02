import { Award, Clock, TrendingUp, Users } from "lucide-react";
import { dashboardStats } from "@/data/dashboard";
import { cx } from "@/lib/utils";

const icons = {
  Award,
  Users,
  Clock,
  TrendingUp
};

export function StatsGrid() {
  return (
    <section className="stats-section">
      <div className="site-container stats-grid">
        {dashboardStats.map((stat) => {
          const Icon = icons[stat.icon as keyof typeof icons];

          return (
            <article className="stat-card" key={stat.label}>
              <div className="stat-card__header">
                <h2>{stat.label}</h2>
                <Icon className={cx(stat.tone === "accent" ? "icon-accent" : "icon-primary")} />
              </div>
              <strong>{stat.value}</strong>
              <p>{stat.note}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
