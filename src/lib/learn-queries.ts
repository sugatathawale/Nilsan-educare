import { apiRequest } from "@/lib/api";
import type { CourseSummary, LessonItem } from "@/lib/admin-types";
import type { MyEnrollment } from "@/lib/auth-types";

export const learnKeys = {
  enrollments: ["enrollments", "my"] as const,
  course: (slug: string) => ["courses", slug] as const,
  lessons: (slug: string) => ["lessons", "course", slug] as const,
  player: (slug: string) => ["learn-player", slug] as const
};

export async function fetchMyEnrollments() {
  const data = await apiRequest<{ enrollments: MyEnrollment[] }>(
    "/enrollments/my"
  );
  return data.enrollments;
}

export async function fetchCourseBySlug(slug: string) {
  const data = await apiRequest<{ course: CourseSummary }>(`/courses/${slug}`);
  return data.course;
}

export async function fetchCourseLessons(slug: string) {
  const data = await apiRequest<{ lessons: LessonItem[] }>(
    `/lessons/course/${slug}`
  );
  return data.lessons;
}

export async function fetchCoursePlayerBundle(slug: string) {
  const [lessons, course] = await Promise.all([
    fetchCourseLessons(slug),
    fetchCourseBySlug(slug).catch(() => null)
  ]);

  return {
    lessons,
    courseTitle: course?.title || slug
  };
}
