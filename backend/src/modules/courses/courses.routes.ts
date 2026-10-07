import { Router } from "express";
import * as coursesController from "./courses.controller.js";

export const coursesRouter = Router();

coursesRouter.get("/", coursesController.listCourses);
coursesRouter.get("/:slug", coursesController.getCourseBySlug);
