import { CoursesSection } from "@/components/dashboard/courses-section";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { ExploreCourses } from "@/components/dashboard/explore-courses";

export default function DashboardPage() {
  return (
    <>
      <DashboardHero />
      <CoursesSection />
      <ExploreCourses />
    </>
  );
}
