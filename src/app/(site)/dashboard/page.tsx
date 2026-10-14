import { CoursesSection } from "@/components/dashboard/courses-section";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { ExploreCourses } from "@/components/dashboard/explore-courses";
import { HomePlaylistsSection } from "@/components/dashboard/home-playlists-section";
import { HomeStorySection } from "@/components/dashboard/home-story-section";
import { LibrarySection } from "@/components/dashboard/library-section";
import { MobileDashRail } from "@/components/dashboard/mobile-dash-rail";

export default function DashboardPage() {
  return (
    <>
      <DashboardHero />
      <MobileDashRail />
      <CoursesSection />
      <HomePlaylistsSection />
      <HomeStorySection />
      <LibrarySection />
      <ExploreCourses />
    </>
  );
}
