import fs from "node:fs/promises";
import path from "node:path";
import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/error.middleware.js";
import { sendSuccess } from "../../utils/api-response.js";
import { getParam } from "../../utils/request.js";
import {
  createCourseSchema,
  updateCourseSchema
} from "./courses.validator.js";

const uploadsRoot = path.resolve(process.cwd(), "uploads", "courses");

function parseBody(req: Request) {
  return {
    ...req.body,
    pricePaise:
      req.body.pricePaise !== undefined
        ? Number(req.body.pricePaise)
        : undefined,
    originalPricePaise:
      req.body.originalPricePaise === "" ||
      req.body.originalPricePaise === undefined ||
      req.body.originalPricePaise === null
        ? undefined
        : Number(req.body.originalPricePaise)
  };
}

async function removeImageFile(imageUrl?: string | null) {
  if (!imageUrl || !imageUrl.startsWith("/uploads/courses/")) return;
  const filename = path.basename(imageUrl);
  await fs.unlink(path.join(uploadsRoot, filename)).catch(() => undefined);
}

export const listCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const includeInactive = req.query.all === "1";

    const courses = await prisma.course.findMany({
      where: includeInactive ? undefined : { isActive: true },
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

export const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = createCourseSchema.parse(parseBody(req));

    const existing = await prisma.course.findUnique({
      where: { slug: input.slug }
    });
    if (existing) {
      throw new AppError("A course with this slug already exists", 409);
    }

    const imageUrl = req.file
      ? `/uploads/courses/${req.file.filename}`
      : null;

    const course = await prisma.course.create({
      data: {
        title: input.title,
        slug: input.slug,
        tagline: input.tagline,
        description: input.description,
        badge: input.badge,
        duration: input.duration,
        level: input.level,
        mode: input.mode,
        classLength: input.classLength,
        pricePaise: input.pricePaise,
        originalPricePaise: input.originalPricePaise,
        isActive: input.isActive,
        imageUrl
      },
      include: {
        _count: { select: { lessons: true } }
      }
    });

    res.status(201).json(sendSuccess({ course }, "Course created"));
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => undefined);
    }
    next(error);
  }
};

export const updateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    const input = updateCourseSchema.parse(parseBody(req));

    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Course not found", 404);
    }

    if (input.slug && input.slug !== existing.slug) {
      const slugTaken = await prisma.course.findUnique({
        where: { slug: input.slug }
      });
      if (slugTaken) {
        throw new AppError("A course with this slug already exists", 409);
      }
    }

    const imageUrl = req.file
      ? `/uploads/courses/${req.file.filename}`
      : undefined;

    const course = await prisma.course.update({
      where: { id },
      data: {
        ...input,
        ...(imageUrl ? { imageUrl } : {})
      },
      include: {
        _count: { select: { lessons: true } }
      }
    });

    if (imageUrl && existing.imageUrl) {
      await removeImageFile(existing.imageUrl);
    }

    res.json(sendSuccess({ course }, "Course updated"));
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => undefined);
    }
    next(error);
  }
};

export const deleteCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    const course = await prisma.course.findUnique({ where: { id } });

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    await prisma.course.delete({ where: { id } });
    await removeImageFile(course.imageUrl);

    res.json(sendSuccess(null, "Course deleted"));
  } catch (error) {
    next(error);
  }
};
