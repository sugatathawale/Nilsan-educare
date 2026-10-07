import type { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/api-response.js";
import * as paymentsService from "./payments.service.js";

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await paymentsService.createOrder(req.user!.userId, req.body);
    res.status(201).json(sendSuccess(order, "Payment order created"));
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await paymentsService.verifyPayment(req.user!.userId, req.body);
    res.json(sendSuccess(result, "Payment verified successfully"));
  } catch (error) {
    next(error);
  }
};

export const listPayments = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payments = await paymentsService.listPayments();
    res.json(sendSuccess({ payments }, "Payments fetched"));
  } catch (error) {
    next(error);
  }
};
