import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/role.middleware.js";
import * as enrollmentsController from "./enrollments.controller.js";

export const enrollmentsRouter = Router();

enrollmentsRouter.get("/my", authenticate, enrollmentsController.getMyEnrollments);
enrollmentsRouter.get(
  "/check/:slug",
  authenticate,
  enrollmentsController.checkEnrollment
);
enrollmentsRouter.get(
  "/",
  authenticate,
  requireAdmin,
  enrollmentsController.listAllEnrollments
);
