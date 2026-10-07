import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/role.middleware.js";
import * as usersController from "./users.controller.js";

export const usersRouter = Router();

usersRouter.get("/profile", authenticate, usersController.getProfile);
usersRouter.get("/", authenticate, requireAdmin, usersController.listStudents);
