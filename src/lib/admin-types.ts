import type { AppUser } from "@/lib/auth-types";

export type AdminUser = AppUser;

export type AdminStudent = {
  id: string;
  fullName: string;
  email: string;
  institution: string;
  academicYear: string;
  classGrade: string;
  city: string | null;
  state: string | null;
  country: string;
  createdAt: string;
  enrollments: Array<{
    id: string;
    status: EnrollmentStatus;
    course: { title: string; slug: string };
  }>;
};

export type CourseSummary = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;
  badge: string | null;
  duration: string | null;
  level: string | null;
  mode: string | null;
  classLength: string | null;
  imageUrl: string | null;
  pricePaise: number;
  originalPricePaise: number | null;
  isActive: boolean;
  createdAt: string;
  _count: { lessons: number };
};

export type LessonNote = {
  id: string;
  title: string;
  fileUrl: string;
  createdAt: string;
};

export type LessonItem = {
  id: string;
  title: string;
  order: number;
  duration: string | null;
  videoUrl: string | null;
  videoId: string | null;
  embedUrl?: string | null;
  playbackUrl?: string | null;
  notes?: LessonNote[];
};

export type BunnyVideoConfig = {
  configured: boolean;
  libraryId: string | null;
  cdnHostname: string | null;
};

export type EnrollmentStatus = "PENDING" | "PAID" | "EXPIRED" | "CANCELLED";
export type PaymentStatus = "CREATED" | "PAID" | "FAILED";

export type EnrollmentRow = {
  id: string;
  status: EnrollmentStatus;
  createdAt: string;
  user: { fullName: string; email: string };
  course: { title: string; slug: string };
};

export type PaymentRow = {
  id: string;
  amountPaise: number;
  status: PaymentStatus;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  createdAt: string;
  user: { fullName: string; email: string };
  course: { title: string; slug: string };
};

export type DashboardStats = {
  stats: {
    studentCount: number;
    courseCount: number;
    paidEnrollments: number;
  };
  recentPayments: PaymentRow[];
};
