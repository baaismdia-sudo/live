import { z } from "zod";

export const newsArticleSchema = z.object({
  tournamentId: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  title: z.string().trim().min(4, "Title is too short").max(150),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  excerpt: z.string().trim().max(300).optional(),
  content: z.string().trim().min(20, "Content is too short"),
  coverImageUrl: z.string().url().optional(),
  isPublished: z.boolean().default(false),
  publishedAt: z.coerce.date().optional(),
});

export type NewsArticleInput = z.infer<typeof newsArticleSchema>;
