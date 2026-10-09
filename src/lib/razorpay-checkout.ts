import { apiRequest } from "@/lib/api";

export type RazorpayOrderPayload = {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  course?: {
    id: string;
    slug: string;
    title: string;
  };
};

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
  theme?: { color?: string };
  prefill?: { name?: string; email?: string };
};

type RazorpayInstance = {
  open: () => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadRazorpayScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay can only run in the browser"));
  }
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Razorpay"))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(script);
  });

  return scriptPromise;
}

export async function openRazorpayCheckout(options: {
  order: RazorpayOrderPayload;
  description: string;
  prefill?: { name?: string; email?: string };
  onDismiss?: () => void;
}): Promise<RazorpaySuccessResponse> {
  await loadRazorpayScript();
  if (!window.Razorpay) {
    throw new Error("Razorpay failed to initialize");
  }

  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay!({
      key: options.order.keyId,
      amount: options.order.amount,
      currency: options.order.currency,
      name: "Nilsan Educare",
      description: options.description,
      order_id: options.order.orderId,
      prefill: options.prefill,
      theme: { color: "#e45137" },
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => {
          options.onDismiss?.();
          reject(new Error("Payment cancelled"));
        }
      }
    });
    checkout.open();
  });
}

export async function createCourseOrder(courseSlug: string) {
  return apiRequest<
    | (RazorpayOrderPayload & { demo?: false })
    | { demo: true; courseSlug: string }
  >("/payments/create-order", {
    method: "POST",
    body: { courseSlug }
  });
}

export async function verifyCoursePayment(response: RazorpaySuccessResponse) {
  return apiRequest<{ alreadyPaid: boolean; courseSlug: string }>(
    "/payments/verify",
    {
      method: "POST",
      body: {
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature
      }
    }
  );
}

export async function createLibraryOrder() {
  return apiRequest<
    | {
        demo: true;
        subscription: unknown;
      }
    | (RazorpayOrderPayload & {
        demo?: false;
        subscription: unknown;
      })
  >("/library/subscribe", { method: "POST" });
}

export async function verifyLibraryPayment(response: RazorpaySuccessResponse) {
  return apiRequest<{ subscribed: boolean }>("/library/subscribe/verify", {
    method: "POST",
    body: {
      razorpayOrderId: response.razorpay_order_id,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature
    }
  });
}
