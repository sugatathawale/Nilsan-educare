export type AppUser = {
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

export type StudentSignupInput = {
  fullName: string;
  institution: string;
  academicYear: string;
  classGrade: string;
  email: string;
  password: string;
  confirmPassword: string;
  city?: string;
  state?: string;
  country?: string;
};

export type MyEnrollment = {
  id: string;
  status: string;
  createdAt: string;
  course: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    pricePaise: number;
    lessons: Array<{
      id: string;
      title: string;
      order: number;
      duration: string | null;
    }>;
  };
};
