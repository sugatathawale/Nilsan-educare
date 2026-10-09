import crypto from "node:crypto";
import { env, isRazorpayConfigured } from "../../config/env.js";
import { PAYMENT } from "../../config/constants.js";
import { prisma } from "../../lib/prisma.js";
import { getRazorpay } from "../../lib/razorpay.js";
import { AppError } from "../../middleware/error.middleware.js";
import type { CreateOrderInput, VerifyPaymentInput } from "./payments.validator.js";

export const createOrder = async (userId: string, input: CreateOrderInput) => {
  const course = await prisma.course.findUnique({
    where: { slug: input.courseSlug, isActive: true }
  });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId: course.id }
    }
  });

  if (existingEnrollment?.status === "PAID") {
    throw new AppError("You are already enrolled in this course", 409);
  }

  // Dev / no Razorpay: enrol immediately so the checkout flow is usable
  if (!isRazorpayConfigured) {
    const demoOrderId = `demo_course_${course.id}_${Date.now()}`;

    await prisma.$transaction([
      prisma.payment.create({
        data: {
          userId,
          courseId: course.id,
          razorpayOrderId: demoOrderId,
          razorpayPaymentId: `demo_pay_${Date.now()}`,
          amountPaise: course.pricePaise,
          status: "PAID"
        }
      }),
      prisma.enrollment.upsert({
        where: {
          userId_courseId: { userId, courseId: course.id }
        },
        update: { status: "PAID" },
        create: {
          userId,
          courseId: course.id,
          status: "PAID"
        }
      })
    ]);

    return {
      demo: true as const,
      courseSlug: course.slug
    };
  }

  const razorpay = getRazorpay();

  const order = await razorpay.orders.create({
    amount: course.pricePaise,
    currency: PAYMENT.CURRENCY,
    receipt: `course_${course.id}_${Date.now()}`,
    notes: {
      userId,
      courseId: course.id,
      courseSlug: course.slug
    }
  });

  await prisma.payment.create({
    data: {
      userId,
      courseId: course.id,
      razorpayOrderId: order.id,
      amountPaise: course.pricePaise,
      status: "CREATED"
    }
  });

  if (!existingEnrollment) {
    await prisma.enrollment.create({
      data: {
        userId,
        courseId: course.id,
        status: "PENDING"
      }
    });
  }

  return {
    orderId: order.id,
    amount: course.pricePaise,
    currency: PAYMENT.CURRENCY,
    keyId: env.RAZORPAY_KEY_ID,
    course: {
      id: course.id,
      slug: course.slug,
      title: course.title
    }
  };
};

export const verifyPayment = async (userId: string, input: VerifyPaymentInput) => {
  if (!isRazorpayConfigured) {
    throw new AppError("Payment gateway is not configured", 503);
  }

  const body = `${input.razorpayOrderId}|${input.razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSignature !== input.razorpaySignature) {
    throw new AppError("Invalid payment signature", 400);
  }

  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId: input.razorpayOrderId },
    include: { course: true }
  });

  if (!payment || payment.userId !== userId) {
    throw new AppError("Payment record not found", 404);
  }

  if (payment.status === "PAID") {
    return {
      alreadyPaid: true,
      courseSlug: payment.course.slug
    };
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        razorpayPaymentId: input.razorpayPaymentId
      }
    }),
    prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: payment.userId,
          courseId: payment.courseId
        }
      },
      update: { status: "PAID" },
      create: {
        userId: payment.userId,
        courseId: payment.courseId,
        status: "PAID"
      }
    })
  ]);

  return {
    alreadyPaid: false,
    courseSlug: payment.course.slug
  };
};

export const listPayments = async () => {
  return prisma.payment.findMany({
    include: {
      user: { select: { fullName: true, email: true } },
      course: { select: { title: true, slug: true } }
    },
    orderBy: { createdAt: "desc" }
  });
};
