import { Router } from "express";
import multer from "multer";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/role.middleware.js";
import { uploadsRoot } from "../../lib/uploads-path.js";
import * as coursesController from "./courses.controller.js";

const uploadsDir = uploadsRoot("courses");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const safe = file.originalname
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, "-")
      .replace(/-+/g, "-");
    cb(null, `${Date.now()}-${safe}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
      return;
    }
    cb(new Error("Only image files are allowed"));
  }
});

export const coursesRouter = Router();

coursesRouter.get("/", coursesController.listCourses);
coursesRouter.get("/:slug", coursesController.getCourseBySlug);

coursesRouter.post(
  "/",
  authenticate,
  requireAdmin,
  upload.single("image"),
  coursesController.createCourse
);

coursesRouter.patch(
  "/:id",
  authenticate,
  requireAdmin,
  upload.single("image"),
  coursesController.updateCourse
);

coursesRouter.delete(
  "/:id",
  authenticate,
  requireAdmin,
  coursesController.deleteCourse
);
