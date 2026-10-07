import fs from "node:fs/promises";
import path from "node:path";
import type { Request, Response, NextFunction } from "express";
import type { GalleryCategory } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/error.middleware.js";
import { sendSuccess } from "../../utils/api-response.js";
import { getParam } from "../../utils/request.js";
import { galleryCategorySchema } from "./gallery.validator.js";

const uploadsRoot = path.resolve(process.cwd(), "uploads", "gallery");

export const listGallery = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categoryParam = typeof req.query.category === "string"
      ? req.query.category.toUpperCase()
      : undefined;

    let category: GalleryCategory | undefined;
    if (categoryParam) {
      const parsed = galleryCategorySchema.safeParse(categoryParam);
      if (!parsed.success) {
        throw new AppError("Invalid gallery category", 400);
      }
      category = parsed.data;
    }

    const images = await prisma.galleryImage.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: "desc" }
    });

    res.json(sendSuccess({ images }, "Gallery images fetched"));
  } catch (error) {
    next(error);
  }
};

export const createGalleryImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      throw new AppError("Image file is required", 400);
    }

    const category = galleryCategorySchema.parse(
      String(req.body.category || "").toUpperCase()
    );
    const title =
      typeof req.body.title === "string" && req.body.title.trim()
        ? req.body.title.trim()
        : null;

    const imageUrl = `/uploads/gallery/${file.filename}`;

    const image = await prisma.galleryImage.create({
      data: {
        category,
        title,
        imageUrl
      }
    });

    res.status(201).json(sendSuccess({ image }, "Gallery image uploaded"));
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => undefined);
    }
    next(error);
  }
};

export const deleteGalleryImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    const image = await prisma.galleryImage.findUnique({ where: { id } });

    if (!image) {
      throw new AppError("Gallery image not found", 404);
    }

    await prisma.galleryImage.delete({ where: { id } });

    const filename = path.basename(image.imageUrl);
    const filePath = path.join(uploadsRoot, filename);
    await fs.unlink(filePath).catch(() => undefined);

    res.json(sendSuccess(null, "Gallery image deleted"));
  } catch (error) {
    next(error);
  }
};
