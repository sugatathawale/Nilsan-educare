import { apiRequest } from "@/lib/api";
import type {
  AdminStudent,
  BunnyVideoConfig,
  CourseSummary,
  DashboardStats,
  EnrollmentRow,
  LessonItem,
  PaymentRow
} from "@/lib/admin-types";
import type { GalleryCategory, GalleryImage } from "@/lib/gallery";
import type { LibraryPlan, LibraryResource } from "@/lib/library";

export const adminKeys = {
  dashboard: ["admin", "dashboard"] as const,
  students: ["admin", "students"] as const,
  courses: ["admin", "courses"] as const,
  enrollments: ["admin", "enrollments"] as const,
  payments: ["admin", "payments"] as const,
  gallery: (category: GalleryCategory) =>
    ["admin", "gallery", category] as const,
  library: ["admin", "library"] as const,
  lessons: (slug: string) => ["admin", "lessons", slug] as const,
  bunnyConfig: ["admin", "bunny-config"] as const
};

export async function fetchAdminDashboard() {
  return apiRequest<DashboardStats>("/admin/dashboard");
}

export async function fetchAdminStudents() {
  const data = await apiRequest<{ students: AdminStudent[] }>("/users");
  return data.students;
}

export async function fetchAdminCourses() {
  const data = await apiRequest<{ courses: CourseSummary[] }>("/courses?all=1");
  return data.courses;
}

export async function fetchAdminCoursesActive() {
  const data = await apiRequest<{ courses: CourseSummary[] }>("/courses");
  return data.courses;
}

export async function fetchAdminEnrollments() {
  const data = await apiRequest<{ enrollments: EnrollmentRow[] }>(
    "/enrollments"
  );
  return data.enrollments;
}

export async function fetchAdminPayments() {
  const data = await apiRequest<{ payments: PaymentRow[] }>("/payments");
  return data.payments;
}

export async function fetchAdminGallery(category: GalleryCategory) {
  const data = await apiRequest<{ images: GalleryImage[] }>(
    `/gallery?category=${category}`
  );
  return data.images;
}

export async function fetchAdminLibrary() {
  return apiRequest<{
    plan: LibraryPlan;
    resources: LibraryResource[];
  }>("/library");
}

export async function fetchAdminLessons(slug: string) {
  const data = await apiRequest<{ lessons: LessonItem[] }>(
    `/lessons/course/${slug}`
  );
  return data.lessons;
}

export async function fetchBunnyConfig() {
  return apiRequest<BunnyVideoConfig>("/lessons/video-config");
}
