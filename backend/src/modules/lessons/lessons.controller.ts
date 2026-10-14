import fs from "node:fs/promises";
import path from "node:path";
import type { Request, Response, NextFunction } from "express";
import {
  createBunnyVideo,
  deleteBunnyVideo,
  getBunnyConfigPublic,
  getBunnyEmbedUrl,
  isBunnyConfigured,
  uploadBunnyVideo
} from "../../lib/bunny.js";
import { prisma } from "../../lib/prisma.js";
import { toEmbedVideoUrl } from "../../lib/video-url.js";
import { AppError } from "../../middleware/error.middleware.js";
import { sendSuccess } from "../../utils/api-response.js";
import { getParam } from "../../utils/request.js";

const notesUploadsRoot = path.resolve(process.cwd(), "uploads", "notes");

const withPlayback = <
  T extends {
    videoId: string | null;
    videoUrl: string | null;
  }
>(
  lesson: T
) => {
  const embedUrl = toEmbedVideoUrl(
    lesson.videoId && isBunnyConfigured
      ? getBunnyEmbedUrl(lesson.videoId)
      : lesson.videoUrl
  );

  return {
    ...lesson,
    embedUrl,
    playbackUrl: embedUrl
  };
};

export const getVideoConfig = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.json(
      sendSuccess(getBunnyConfigPublic(), "Bunny Stream config fetched")
    );
  } catch (error) {
    next(error);
  }
};

export const createVideo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const video = await createBunnyVideo(req.body.title);
    res.status(201).json(
      sendSuccess(
        {
          videoId: video.videoId,
          embedUrl: video.embedUrl,
          hlsUrl: video.hlsUrl
        },
        "Bunny video created. Upload the file next."
      )
    );
  } catch (error) {
    next(error);
  }
};

export const uploadVideo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const videoId = getParam(req.params.videoId);
    const file = req.file;

    if (!file) {
      throw new AppError("Video file is required", 400);
    }

    await uploadBunnyVideo(videoId, file.buffer, file.mimetype);

    const embedUrl = getBunnyEmbedUrl(videoId);

    res.json(
      sendSuccess(
        {
          videoId,
          embedUrl,
          status: "uploaded"
        },
        "Video uploaded to Bunny Stream. Encoding may take a few minutes."
      )
    );
  } catch (error) {
    next(error);
  }
};

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
        videoId: true,
        notes: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            fileUrl: true,
            createdAt: true
          }
        }
      }
    });

    res.json(
      sendSuccess(
        { lessons: lessons.map(withPlayback) },
        "Lessons fetched"
      )
    );
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

    const videoId = req.body.videoId?.trim() || null;
    const videoUrl = toEmbedVideoUrl(
      req.body.videoUrl ||
        (videoId && isBunnyConfigured ? getBunnyEmbedUrl(videoId) : null)
    );

    const lesson = await prisma.lesson.create({
      data: {
        courseId: course.id,
        title: req.body.title,
        order: req.body.order,
        videoUrl,
        videoId,
        duration: req.body.duration || null
      }
    });

    res
      .status(201)
      .json(sendSuccess({ lesson: withPlayback(lesson) }, "Lesson created"));
  } catch (error) {
    next(error);
  }
};


export const updateLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    const existing = await prisma.lesson.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Lesson not found", 404);
    }

    const title =
      typeof req.body.title === "string" && req.body.title.trim()
        ? req.body.title.trim()
        : existing.title;
    const order =
      req.body.order !== undefined ? Number(req.body.order) : existing.order;
    if (!Number.isInteger(order) || order < 1) {
      throw new AppError("Order must be a positive integer", 400);
    }

    const duration =
      req.body.duration !== undefined
        ? req.body.duration?.trim() || null
        : existing.duration;

    let videoId = existing.videoId;
    let videoUrl = existing.videoUrl;

    if (req.body.videoId !== undefined) {
      videoId = req.body.videoId?.trim() || null;
    }

    if (req.body.videoUrl !== undefined) {
      videoUrl = toEmbedVideoUrl(req.body.videoUrl) || null;
    } else if (videoId && isBunnyConfigured && req.body.videoId !== undefined) {
      videoUrl = toEmbedVideoUrl(getBunnyEmbedUrl(videoId));
    }

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        title,
        order,
        duration,
        videoId,
        videoUrl
      }
    });

    res.json(sendSuccess({ lesson: withPlayback(lesson) }, "Lesson updated"));
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

    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson) {
      throw new AppError("Lesson not found", 404);
    }

    await prisma.lesson.delete({ where: { id } });

    if (lesson.videoId) {
      await deleteBunnyVideo(lesson.videoId);
    }

    res.json(sendSuccess(null, "Lesson deleted"));
  } catch (error) {
    next(error);
  }
};

export const addLessonNote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lessonId = getParam(req.params.id);
    const file = req.file;
    if (!file) throw new AppError("Note file is required", 400);

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new AppError("Lesson not found", 404);

    const title =
      (typeof req.body.title === "string" && req.body.title.trim()) ||
      file.originalname;

    const note = await prisma.lessonNote.create({
      data: {
        lessonId,
        title,
        fileUrl: `/uploads/notes/${file.filename}`
      }
    });

    res.status(201).json(sendSuccess({ note }, "Lecture note uploaded"));
  } catch (error) {
    if (req.file) await fs.unlink(req.file.path).catch(() => undefined);
    next(error);
  }
};

export const deleteLessonNote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = getParam(req.params.noteId);
    const note = await prisma.lessonNote.findUnique({ where: { id } });
    if (!note) throw new AppError("Lecture note not found", 404);

    await prisma.lessonNote.delete({ where: { id } });
    const filename = path.basename(note.fileUrl);
    await fs
      .unlink(path.join(notesUploadsRoot, filename))
      .catch(() => undefined);

    res.json(sendSuccess(null, "Lecture note deleted"));
  } catch (error) {
    next(error);
  }
};
