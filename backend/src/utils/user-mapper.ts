import type { UserRole } from "@prisma/client";

export type SafeUser = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  institution: string;
  academicYear: string;
  classGrade: string;
  city: string | null;
  state: string | null;
  country: string;
  createdAt: Date;
};

export const toSafeUser = (user: {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  institution: string;
  academicYear: string;
  classGrade: string;
  city: string | null;
  state: string | null;
  country: string;
  createdAt: Date;
}): SafeUser => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  institution: user.institution,
  academicYear: user.academicYear,
  classGrade: user.classGrade,
  city: user.city,
  state: user.state,
  country: user.country,
  createdAt: user.createdAt
});
