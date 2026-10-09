export type CheckoutIntent =
  | { type: "course"; courseSlug: string }
  | { type: "library" };

const INTENT_KEY = "nilsan_checkout_intent";

function safePath(value: string | null | undefined, fallback = "/dashboard") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  return value;
}

export function saveCheckoutIntent(intent: CheckoutIntent) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(INTENT_KEY, JSON.stringify(intent));
}

export function readCheckoutIntent(): CheckoutIntent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(INTENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CheckoutIntent;
    if (parsed?.type === "course" && parsed.courseSlug) return parsed;
    if (parsed?.type === "library") return parsed;
    return null;
  } catch {
    return null;
  }
}

export function clearCheckoutIntent() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(INTENT_KEY);
}

export function buildAuthHref(
  mode: "login" | "signup",
  nextPath: string,
  intent?: CheckoutIntent
) {
  if (intent) saveCheckoutIntent(intent);
  const next = safePath(nextPath);
  const params = new URLSearchParams({ next });
  return `/${mode}?${params.toString()}`;
}

/** Send guests to login before payment. Returns true if redirected. */
export function requireAuthForCheckout(options: {
  isLoggedIn: boolean;
  nextPath: string;
  intent: CheckoutIntent;
  preferSignup?: boolean;
}) {
  if (options.isLoggedIn) return false;
  const href = buildAuthHref(
    options.preferSignup ? "signup" : "login",
    options.nextPath,
    options.intent
  );
  window.location.href = href;
  return true;
}

export function resolveAuthNext(
  searchParams: URLSearchParams | { get: (key: string) => string | null }
) {
  return safePath(searchParams.get("next"), "/my-learning");
}
