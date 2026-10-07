import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/error.middleware.js";
import { sendSuccess } from "../../utils/api-response.js";
import { getParam } from "../../utils/request.js";

export const getCourseLessons = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const slug = getParam(req.params.slug);
    const isAdmin = req.user!.role === "ADMIN";

    if (!isAdmin) {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId: req.user!.userId,
          status: "PAID",
          course: { slug }
        }
      });

      if (!enrollment) {
        throw new AppError(
          "You must enroll in this course to access lessons",
          403
        );
      }
    }

    const lessons = await prisma.lesson.findMany({
      where: { course: { slug } },
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        order: true,
        duration: true,
        videoUrl: true,
        videoId: true
      }
    });

    res.json(sendSuccess({ lessons }, "Lessons fetched"));
  } catch (error) {
    next(error);
  }
};

export const createLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const course = await prisma.course.findUnique({
      where: { slug: req.body.courseSlug }
    });

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    const lesson = await prisma.lesson.create({
      data: {
        courseId: course.id,
        title: req.body.title,
        order: req.body.order,
        videoUrl: req.body.videoUrl,
        videoId: req.body.videoId,
        duration: req.body.duration
      }
    });

    res.status(201).json(sendSuccess({ lesson }, "Lesson created"));
  } catch (error) {
    next(error);
  }
};

export const deleteLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = getParam(req.params.id);

    await prisma.lesson.delete({ where: { id } });
    res.json(sendSuccess(null, "Lesson deleted"));
  } catch (error) {
    next(error);
  }
};
