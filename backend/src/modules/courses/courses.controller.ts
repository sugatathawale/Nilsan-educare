import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/error.middleware.js";
import { sendSuccess } from "../../utils/api-response.js";
import { getParam } from "../../utils/request.js";

export const listCourses = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const courses = await prisma.course.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
      include: {
        _count: { select: { lessons: true } }
      }
    });

    res.json(sendSuccess({ courses }, "Courses fetched"));
  } catch (error) {
    next(error);
  }
};

export const getCourseBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const slug = getParam(req.params.slug);

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        lessons: { orderBy: { order: "asc" } },
        _count: { select: { enrollments: true } }
      }
    });

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    res.json(sendSuccess({ course }, "Course fetched"));
  } catch (error) {
    next(error);
  }
};
