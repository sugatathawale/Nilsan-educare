import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/role.middleware.js";
import { validateBody } from "../../middleware/validate.middleware.js";
import * as paymentsController from "./payments.controller.js";
import { createOrderSchema, verifyPaymentSchema } from "./payments.validator.js";

export const paymentsRouter = Router();

paymentsRouter.post(
  "/create-order",
  authenticate,
  validateBody(createOrderSchema),
  paymentsController.createOrder
);

paymentsRouter.post(
  "/verify",
  authenticate,
  validateBody(verifyPaymentSchema),
  paymentsController.verifyPayment
);

paymentsRouter.get(
  "/",
  authenticate,
  requireAdmin,
  paymentsController.listPayments
);
