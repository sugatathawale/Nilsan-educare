export const AUTH = {
  BCRYPT_ROUNDS: 12,
  MIN_PASSWORD_LENGTH: 8
} as const;

export const PAYMENT = {
  CURRENCY: "INR"
} as const;

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
} as const;
