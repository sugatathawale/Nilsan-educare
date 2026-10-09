import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length ? value : undefined))
  .optional();

const pricePaiseSchema = z.coerce
  .number()
  .int()
  .min(0, "Price must be 0 or more");

const optionalPricePaiseSchema = z
  .union([z.literal(""), z.null(), z.undefined(), pricePaiseSchema])
  .transform((value) =>
    value === "" || value === null || value === undefined ? undefined : value
  );

export const createCourseSchema = z.object({
  title: z.string().trim().min(2, "Title is required"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  tagline: optionalText,
  description: optionalText,
  badge: optionalText,
  duration: optionalText,
  level: optionalText,
  mode: optionalText,
  classLength: optionalText,
  pricePaise: pricePaiseSchema,
  originalPricePaise: optionalPricePaiseSchema,
  isActive: z
    .union([z.boolean(), z.literal("true"), z.literal("false")])
    .transform((value) => value === true || value === "true")
    .optional()
    .default(true)
});

export const updateCourseSchema = createCourseSchema.partial();

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
