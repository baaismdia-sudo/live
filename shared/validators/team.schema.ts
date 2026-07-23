import { z } from "zod";

export const createTeamSchema = z.object({
  tournamentId: z.string().uuid(),
  groupId: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Team name is too short").max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  logoUrl: z.string().url().optional(),
  managerName: z.string().trim().max(100).optional(),
  contactEmail: z.string().trim().toLowerCase().email().optional(),
  contactPhone: z.string().trim().max(20).optional(),
  seed: z.number().int().positive().optional(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;

export const updateTeamStatusSchema = z.object({
  teamId: z.string().uuid(),
  status: z.enum(["pending", "approved", "rejected"]),
});
