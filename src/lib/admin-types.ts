export type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  institution: string;
  academicYear: string;
  classGrade: string;
  city: string | null;
  state: string | null;
  country: string;
  createdAt: string;
};

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
  description: string | null;
  pricePaise: number;
  isActive: boolean;
  createdAt: string;
  _count: { lessons: number };
};

export type LessonItem = {
  id: string;
  title: string;
  order: number;
  duration: string | null;
  videoUrl: string | null;
  videoId: string | null;
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
