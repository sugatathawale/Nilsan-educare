import { z } from "zod";

const optionalUrl = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.string().trim().url().optional()
);

export const createLessonSchema = z.object({
  courseSlug: z.string().trim().min(1),
  title: z.string().trim().min(2),
  order: z.coerce.number().int().positive(),
  videoUrl: optionalUrl,
  videoId: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.string().trim().optional()
  ),
  duration: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.string().trim().optional()
  )
});

export const createBunnyVideoSchema = z.object({
  title: z.string().trim().min(2)
});

export const updateLessonSchema = createLessonSchema
  .partial()
  .omit({ courseSlug: true });

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type CreateBunnyVideoInput = z.infer<typeof createBunnyVideoSchema>;
