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

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    // 500 MB max lecture upload
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
  upload.single("video"),
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

lessonsRouter.delete(
  "/:id",
  authenticate,
  requireAdmin,
  lessonsController.deleteLesson
);
