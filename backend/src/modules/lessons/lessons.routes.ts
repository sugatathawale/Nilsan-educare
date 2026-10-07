import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/role.middleware.js";
import { validateBody } from "../../middleware/validate.middleware.js";
import * as lessonsController from "./lessons.controller.js";
import {
  createBunnyVideoSchema,
  createLessonSchema
} from "./lessons.validator.js";

const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype.startsWith("video/") ||
      file.mimetype === "application/octet-stream"
    ) {
      cb(null, true);
      return;
    }
    cb(new Error("Only video files are allowed"));
  }
});

const notesDir = path.resolve(process.cwd(), "uploads", "notes");
fs.mkdirSync(notesDir, { recursive: true });

const notesUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, notesDir),
    filename: (_req, file, cb) => {
      const safe = file.originalname
        .toLowerCase()
        .replace(/[^a-z0-9.]+/g, "-")
        .replace(/-+/g, "-");
      cb(null, `${Date.now()}-${safe}`);
    }
  }),
  limits: { fileSize: 30 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/msword" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/octet-stream";
    if (ok) {
      cb(null, true);
      return;
    }
    cb(new Error("Only PDF/DOC/image note files are allowed"));
  }
});

export const lessonsRouter = Router();

lessonsRouter.get(
  "/video-config",
  authenticate,
  requireAdmin,
  lessonsController.getVideoConfig
);

lessonsRouter.post(
  "/videos",
  authenticate,
  requireAdmin,
  validateBody(createBunnyVideoSchema),
  lessonsController.createVideo
);

lessonsRouter.post(
  "/videos/:videoId/upload",
  authenticate,
  requireAdmin,
  videoUpload.single("video"),
  lessonsController.uploadVideo
);

lessonsRouter.get(
  "/course/:slug",
  authenticate,
  lessonsController.getCourseLessons
);

lessonsRouter.post(
  "/",
  authenticate,
  requireAdmin,
  validateBody(createLessonSchema),
  lessonsController.createLesson
);

// Specific routes before /:id
lessonsRouter.delete(
  "/notes/:noteId",
  authenticate,
  requireAdmin,
  lessonsController.deleteLessonNote
);

lessonsRouter.post(
  "/:id/notes",
  authenticate,
  requireAdmin,
  notesUpload.single("file"),
  lessonsController.addLessonNote
);

lessonsRouter.delete(
  "/:id",
  authenticate,
  requireAdmin,
  lessonsController.deleteLesson
);
