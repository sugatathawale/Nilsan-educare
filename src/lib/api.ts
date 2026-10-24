function resolveApiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (configured) return configured;

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      return `${window.location.origin}/api/v1`;
    }
    return "http://localhost:4000/api/v1";
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/v1`;
  }

  return "http://localhost:4000/api/v1";
}

function resolveApiOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_API_ORIGIN?.replace(/\/$/, "");
  if (configured) return configured;

  const base = resolveApiBase();
  if (base.startsWith("/")) {
    if (typeof window !== "undefined") return window.location.origin;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
  }

  return base.replace(/\/api\/v1\/?$/, "") || "http://localhost:4000";
}

export function mediaUrl(pathOrUrl: string | null | undefined): string {
  if (!pathOrUrl) return "";
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  const origin = resolveApiOrigin();
  return `${origin}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiError = {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
};

export class ApiRequestError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.errors = errors;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body } = options;
  const apiBase = resolveApiBase();

  const response = await fetch(`${apiBase}${path}`, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });

  let payload: ApiSuccess<T> | ApiError | null = null;

  try {
    payload = (await response.json()) as ApiSuccess<T> | ApiError;
  } catch {
    throw new ApiRequestError("Unexpected server response", response.status);
  }

  if (!response.ok || !payload.success) {
    throw new ApiRequestError(
      payload.message || "Request failed",
      response.status,
      payload.success ? undefined : payload.errors
    );
  }

  return payload.data;
}

/** Multipart upload. Do not set Content-Type — browser sets boundary. */
export async function apiUpload<T>(
  path: string,
  formData: FormData,
  method: "POST" | "PATCH" | "PUT" = "POST"
): Promise<T> {
  const apiBase = resolveApiBase();
  const response = await fetch(`${apiBase}${path}`, {
    method,
    credentials: "include",
    body: formData
  });

  let payload: ApiSuccess<T> | ApiError | null = null;

  try {
    payload = (await response.json()) as ApiSuccess<T> | ApiError;
  } catch {
    throw new ApiRequestError("Unexpected server response", response.status);
  }

  if (!response.ok || !payload.success) {
    throw new ApiRequestError(
      payload.message || "Upload failed",
      response.status,
      payload.success ? undefined : payload.errors
    );
  }

  return payload.data;
}

export function formatPaise(amountPaise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amountPaise / 100);
}

export function formatDate(value: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function formatDateTime(value: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}
