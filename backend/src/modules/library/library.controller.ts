import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import type { Request, Response, NextFunction } from "express";
import type { ResourceType } from "@prisma/client";
import { env, isRazorpayConfigured } from "../../config/env.js";
import { PAYMENT } from "../../config/constants.js";
import { getRazorpay } from "../../lib/razorpay.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/error.middleware.js";
import { sendSuccess } from "../../utils/api-response.js";
import { getParam } from "../../utils/request.js";

const uploadsRoot = path.resolve(process.cwd(), "uploads", "library");

const ensurePlan = async () => {
  return prisma.libraryPlan.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      title: "Notes & Audiobook Access",
      description:
        "Unlock all premium lecture notes and audiobooks. First few items stay free forever.",
      pricePaise: 49900,
      freeLimit: 5
    }
  });
};

const hasActiveSubscription = async (userId?: string) => {
  if (!userId) return false;
  const sub = await prisma.librarySubscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }]
    },
    orderBy: { createdAt: "desc" }
  });
  return Boolean(sub);
};

export const getPlan = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const plan = await ensurePlan();
    res.json(sendSuccess({ plan }, "Library plan fetched"));
  } catch (error) {
    next(error);
  }
};

export const updatePlan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await ensurePlan();
    const pricePaise = Number(req.body.pricePaise);
    const freeLimit = Number(req.body.freeLimit);

    if (!Number.isFinite(pricePaise) || pricePaise < 0) {
      throw new AppError("Invalid price", 400);
    }
    if (!Number.isInteger(freeLimit) || freeLimit < 0 || freeLimit > 20) {
      throw new AppError("Free limit must be between 0 and 20", 400);
    }

    const plan = await prisma.libraryPlan.update({
      where: { id: "default" },
      data: {
        title: req.body.title?.trim() || "Notes & Audiobook Access",
        description: req.body.description?.trim() || null,
        pricePaise,
        freeLimit
      }
    });

    res.json(sendSuccess({ plan }, "Library plan updated"));
  } catch (error) {
    next(error);
  }
};

export const listResources = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const plan = await ensurePlan();
    const type = req.query.type
      ? String(req.query.type).toUpperCase()
      : undefined;
    const isAdmin = req.user?.role === "ADMIN";
    const subscribed = isAdmin
      ? true
      : await hasActiveSubscription(req.user?.userId);

    const resources = await prisma.libraryResource.findMany({
      where: {
        ...(isAdmin ? {} : { isActive: true }),
        ...(type === "NOTE" || type === "AUDIOBOOK"
          ? { type: type as ResourceType }
          : {})
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
    });

    // Auto-mark first freeLimit items as free for access (also respect isFree)
    const freeIds = new Set(
      resources
        .filter((item) => item.isFree)
        .slice(0, plan.freeLimit)
        .map((item) => item.id)
    );

    // If fewer than freeLimit marked free, include earliest by sortOrder
    if (freeIds.size < plan.freeLimit) {
      for (const item of resources) {
        if (freeIds.size >= plan.freeLimit) break;
        freeIds.add(item.id);
      }
    }

    const mapped = resources.map((item) => {
      const isFree = freeIds.has(item.id) || item.isFree;
      const locked = !isAdmin && !subscribed && !isFree;
      return {
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        coverUrl: item.coverUrl,
        isFree,
        sortOrder: item.sortOrder,
        isActive: item.isActive,
        createdAt: item.createdAt,
        locked,
        fileUrl: locked ? null : item.fileUrl
      };
    });

    res.json(
      sendSuccess(
        {
          plan,
          subscribed,
          resources: mapped
        },
        "Library resources fetched"
      )
    );
  } catch (error) {
    next(error);
  }
};

export const createResource = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const file = req.file;
    if (!file) throw new AppError("File is required", 400);

    const type = String(req.body.type || "").toUpperCase();
    if (type !== "NOTE" && type !== "AUDIOBOOK") {
      throw new AppError("Type must be NOTE or AUDIOBOOK", 400);
    }

    const title = String(req.body.title || "").trim();
    if (title.length < 2) throw new AppError("Title is required", 400);

    const resource = await prisma.libraryResource.create({
      data: {
        type: type as ResourceType,
        title,
        description: req.body.description?.trim() || null,
        fileUrl: `/uploads/library/${file.filename}`,
        isFree: String(req.body.isFree) === "true",
        sortOrder: Number(req.body.sortOrder) || 0,
        isActive: true
      }
    });

    res.status(201).json(sendSuccess({ resource }, "Resource uploaded"));
  } catch (error) {
    if (req.file) await fs.unlink(req.file.path).catch(() => undefined);
    next(error);
  }
};

export const updateResource = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    const existing = await prisma.libraryResource.findUnique({ where: { id } });
    if (!existing) throw new AppError("Resource not found", 404);

    const resource = await prisma.libraryResource.update({
      where: { id },
      data: {
        title: req.body.title?.trim() || existing.title,
        description:
          req.body.description !== undefined
            ? req.body.description?.trim() || null
            : existing.description,
        isFree:
          req.body.isFree !== undefined
            ? Boolean(req.body.isFree)
            : existing.isFree,
        sortOrder:
          req.body.sortOrder !== undefined
            ? Number(req.body.sortOrder)
            : existing.sortOrder,
        isActive:
          req.body.isActive !== undefined
            ? Boolean(req.body.isActive)
            : existing.isActive
      }
    });

    res.json(sendSuccess({ resource }, "Resource updated"));
  } catch (error) {
    next(error);
  }
};

export const deleteResource = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = getParam(req.params.id);
    const existing = await prisma.libraryResource.findUnique({ where: { id } });
    if (!existing) throw new AppError("Resource not found", 404);

    await prisma.libraryResource.delete({ where: { id } });
    const filename = path.basename(existing.fileUrl);
    await fs.unlink(path.join(uploadsRoot, filename)).catch(() => undefined);

    res.json(sendSuccess(null, "Resource deleted"));
  } catch (error) {
    next(error);
  }
};

export const getMySubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const subscribed = await hasActiveSubscription(req.user!.userId);
    const latest = await prisma.librarySubscription.findFirst({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" }
    });
    const plan = await ensurePlan();
    res.json(
      sendSuccess({ subscribed, subscription: latest, plan }, "Subscription status")
    );
  } catch (error) {
    next(error);
  }
};

export const subscribe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const plan = await ensurePlan();
    const userId = req.user!.userId;

    if (await hasActiveSubscription(userId)) {
      throw new AppError("You already have an active subscription", 409);
    }

    // Dev / no Razorpay: activate immediately so the flow is usable
    if (!isRazorpayConfigured) {
      const subscription = await prisma.librarySubscription.create({
        data: {
          userId,
          status: "ACTIVE",
          amountPaise: plan.pricePaise,
          startsAt: new Date()
        }
      });
      res.status(201).json(
        sendSuccess(
          { subscription, demo: true },
          "Library subscription activated (demo mode — Razorpay not configured)"
        )
      );
      return;
    }

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: plan.pricePaise,
      currency: PAYMENT.CURRENCY,
      receipt: `library_${userId}_${Date.now()}`,
      notes: { userId, type: "library_subscription" }
    });

    const subscription = await prisma.librarySubscription.create({
      data: {
        userId,
        status: "PENDING",
        amountPaise: plan.pricePaise,
        razorpayOrderId: order.id
      }
    });

    res.status(201).json(
      sendSuccess(
        {
          subscription,
          orderId: order.id,
          amount: plan.pricePaise,
          currency: PAYMENT.CURRENCY,
          keyId: env.RAZORPAY_KEY_ID
        },
        "Subscription order created"
      )
    );
  } catch (error) {
    next(error);
  }
};

export const verifySubscribe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!isRazorpayConfigured) {
      throw new AppError("Payment gateway is not configured", 503);
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body as {
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
      razorpaySignature?: string;
    };

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw new AppError("Payment verification details are required", 400);
    }

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      throw new AppError("Invalid payment signature", 400);
    }

    const subscription = await prisma.librarySubscription.findUnique({
      where: { razorpayOrderId }
    });

    if (!subscription || subscription.userId !== req.user!.userId) {
      throw new AppError("Subscription order not found", 404);
    }

    if (subscription.status === "ACTIVE") {
      res.json(sendSuccess({ subscribed: true, alreadyPaid: true }, "Already subscribed"));
      return;
    }

    const updated = await prisma.librarySubscription.update({
      where: { id: subscription.id },
      data: {
        status: "ACTIVE",
        razorpayPaymentId,
        startsAt: new Date()
      }
    });

    res.json(
      sendSuccess(
        { subscribed: true, alreadyPaid: false, subscription: updated },
        "Library subscription activated"
      )
    );
  } catch (error) {
    next(error);
  }
};
