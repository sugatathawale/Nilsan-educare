import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { sendSuccess } from "../../utils/api-response.js";
import { getParam } from "../../utils/request.js";

export const getMyEnrollments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: req.user!.userId,
        status: "PAID"
      },
      include: {
        course: {
          include: {
            lessons: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                title: true,
                order: true,
                duration: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(sendSuccess({ enrollments }, "Enrollments fetched"));
  } catch (error) {
    next(error);
  }
};

export const checkEnrollment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const slug = getParam(req.params.slug);

    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: req.user!.userId,
        course: { slug },
        status: "PAID"
      }
    });

    res.json(
      sendSuccess(
        { enrolled: Boolean(enrollment), enrollment },
        "Enrollment status checked"
      )
    );
  } catch (error) {
    next(error);
  }
};

export const listAllEnrollments = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            email: true
          }
        },
        course: {
          select: {
            title: true,
            slug: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(sendSuccess({ enrollments }, "All enrollments fetched"));
  } catch (error) {
    next(error);
  }
};
