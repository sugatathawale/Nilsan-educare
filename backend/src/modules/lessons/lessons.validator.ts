import { z } from "zod";

export const createLessonSchema = z.object({
  courseSlug: z.string().trim().min(1),
  title: z.string().trim().min(2),
  order: z.coerce.number().int().positive(),
  videoUrl: z.string().url().optional(),
  videoId: z.string().optional(),
  duration: z.string().optional()
});

export const updateLessonSchema = createLessonSchema.partial().omit({ courseSlug: true });

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
