import { CoursesSection } from "@/components/dashboard/courses-section";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { ExploreCourses } from "@/components/dashboard/explore-courses";
import { HomeStorySection } from "@/components/dashboard/home-story-section";
import { LibrarySection } from "@/components/dashboard/library-section";

export default function DashboardPage() {
  return (
    <>
      <DashboardHero />
      <CoursesSection />
      <HomeStorySection />
      <LibrarySection />
      <ExploreCourses />
    </>
  );
}
