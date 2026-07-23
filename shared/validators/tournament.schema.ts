import { z } from "zod";

export const tournamentFormatEnum = z.enum(["knockout", "round_robin", "groups_knockout", "league"]);

export const createTournamentSchema = z.object({
  name: z.string().trim().min(3, "Name is too short").max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .min(3)
    .max(80),
  sport: z.string().trim().min(2).max(60),
  description: z.string().trim().max(2000).optional(),
  rentalPlanId: z.string().uuid("Select a rental plan"),
  isPublic: z.boolean().default(true),
  timezone: z.string().default("Asia/Kolkata"),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
});

export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;

export const tournamentSettingsSchema = z.object({
  format: tournamentFormatEnum,
  maxTeams: z.number().int().positive().max(512).optional(),
  rulesText: z.string().trim().max(10000).optional(),
  registrationOpen: z.boolean().default(true),
  registrationDeadline: z.coerce.date().optional(),
  contactEmail: z.string().trim().toLowerCase().email().optional(),
  contactPhone: z.string().trim().max(20).optional(),
  socialLinks: z.record(z.string().url()).optional(),
});

export type TournamentSettingsInput = z.infer<typeof tournamentSettingsSchema>;
