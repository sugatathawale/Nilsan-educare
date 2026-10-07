import Razorpay from "razorpay";
import { env, isRazorpayConfigured } from "../config/env.js";

let razorpayInstance: Razorpay | null = null;

export const getRazorpay = (): Razorpay => {
  if (!isRazorpayConfigured) {
    throw new Error("Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID!,
      key_secret: env.RAZORPAY_KEY_SECRET!
    });
  }

  return razorpayInstance;
};
