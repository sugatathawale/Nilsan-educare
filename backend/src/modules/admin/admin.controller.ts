import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { sendSuccess } from "../../utils/api-response.js";

export const getDashboardStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [studentCount, courseCount, paidEnrollments, recentPayments] =
      await Promise.all([
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.course.count({ where: { isActive: true } }),
        prisma.enrollment.count({ where: { status: "PAID" } }),
        prisma.payment.findMany({
          where: { status: "PAID" },
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { fullName: true, email: true } },
            course: { select: { title: true, slug: true } }
          }
        })
      ]);

    res.json(
      sendSuccess(
        {
          stats: {
            studentCount,
            courseCount,
            paidEnrollments
          },
          recentPayments
        },
        "Admin dashboard stats fetched"
      )
    );
  } catch (error) {
    next(error);
  }
};
