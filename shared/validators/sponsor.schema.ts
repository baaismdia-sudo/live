import { z } from "zod";

export const sponsorSchema = z.object({
  tournamentId: z.string().uuid(),
  name: z.string().trim().min(2, "Sponsor name is too short").max(100),
  logoUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
  tier: z.enum(["platinum", "gold", "silver", "bronze"]).default("bronze"),
  sortOrder: z.number().int().default(0),
});

export type SponsorInput = z.infer<typeof sponsorSchema>;
