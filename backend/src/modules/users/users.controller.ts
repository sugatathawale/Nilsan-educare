import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/error.middleware.js";
import { sendSuccess } from "../../utils/api-response.js";
import { toSafeUser } from "../../utils/user-mapper.js";

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId }
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.json(sendSuccess({ user: toSafeUser(user) }, "Profile fetched"));
  } catch (error) {
    next(error);
  }
};

export const listStudents = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        email: true,
        institution: true,
        academicYear: true,
        classGrade: true,
        city: true,
        state: true,
        country: true,
        createdAt: true,
        enrollments: {
          include: { course: { select: { title: true, slug: true } } }
        }
      }
    });

    res.json(sendSuccess({ students }, "Students fetched"));
  } catch (error) {
    next(error);
  }
};
