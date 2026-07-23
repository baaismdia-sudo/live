import { z } from "zod";

export const galleryItemSchema = z.object({
  tournamentId: z.string().uuid(),
  mediaId: z.string().uuid(),
  caption: z.string().trim().max(200).optional(),
  sortOrder: z.number().int().default(0),
});

export type GalleryItemInput = z.infer<typeof galleryItemSchema>;

export const mediaUploadSchema = z.object({
  tournamentId: z.string().uuid().optional(),
  fileType: z.enum(["image", "video", "document"]),
  fileSizeBytes: z.number().int().positive().max(524288000, "File is too large (max 500MB)"),
  altText: z.string().trim().max(200).optional(),
});

export type MediaUploadInput = z.infer<typeof mediaUploadSchema>;
