import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/role.middleware.js";
import { validateBody } from "../../middleware/validate.middleware.js";
import * as lessonsController from "./lessons.controller.js";
import { createLessonSchema } from "./lessons.validator.js";

export const lessonsRouter = Router();

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
