import { z } from "zod";

export const galleryCategorySchema = z.enum(["EVENTS", "RESULTS", "CLASSROOM"]);

export const createGallerySchema = z.object({
  category: galleryCategorySchema,
  title: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.string().trim().min(2).max(120).optional()
  )
});

export type GalleryCategoryInput = z.infer<typeof galleryCategorySchema>;
export type CreateGalleryInput = z.infer<typeof createGallerySchema>;
