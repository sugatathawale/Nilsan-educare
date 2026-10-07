import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/role.middleware.js";
import * as adminController from "./admin.controller.js";

export const adminRouter = Router();

adminRouter.use(authenticate, requireAdmin);

adminRouter.get("/dashboard", adminController.getDashboardStats);
