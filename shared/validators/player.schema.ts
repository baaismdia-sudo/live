import { z } from "zod";

export const createPlayerSchema = z.object({
  teamId: z.string().uuid(),
  fullName: z.string().trim().min(2, "Player name is too short").max(100),
  jerseyNumber: z.number().int().min(0).max(999).optional(),
  position: z.string().trim().max(40).optional(),
  photoUrl: z.string().url().optional(),
  dateOfBirth: z.coerce.date().optional(),
  nationality: z.string().trim().max(60).optional(),
  isCaptain: z.boolean().default(false),
  status: z.enum(["active", "injured", "suspended"]).default("active"),
});

export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
