import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validateBody } from "../../middleware/validate.middleware.js";
import * as authController from "./auth.controller.js";
import {
  adminLoginSchema,
  loginSchema,
  signupSchema
} from "./auth.validator.js";

export const authRouter = Router();

authRouter.post("/signup", validateBody(signupSchema), authController.signup);
authRouter.post("/login", validateBody(loginSchema), authController.login);
authRouter.post("/admin/login", validateBody(adminLoginSchema), authController.adminLogin);
authRouter.post("/logout", authController.logout);
authRouter.get("/me", authenticate, authController.getMe);
