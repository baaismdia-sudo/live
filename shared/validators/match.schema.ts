import { z } from "zod";

export const createMatchSchema = z.object({
  tournamentId: z.string().uuid(),
  fixtureId: z.string().uuid().optional(),
  homeTeamId: z.string().uuid(),
  awayTeamId: z.string().uuid(),
  venue: z.string().trim().max(150).optional(),
  scheduledAt: z.coerce.date(),
}).refine((data) => data.homeTeamId !== data.awayTeamId, {
  message: "Home and away team must be different",
  path: ["awayTeamId"],
});

export type CreateMatchInput = z.infer<typeof createMatchSchema>;

export const updateLiveScoreSchema = z.object({
  matchId: z.string().uuid(),
  homeScore: z.number().int().min(0).max(999),
  awayScore: z.number().int().min(0).max(999),
  period: z.string().trim().max(40).optional(),
  timeElapsed: z.string().trim().max(20).optional(),
  isLive: z.boolean().default(true),
});

export type UpdateLiveScoreInput = z.infer<typeof updateLiveScoreSchema>;

export const matchEventSchema = z.object({
  matchId: z.string().uuid(),
  teamId: z.string().uuid().optional(),
  playerId: z.string().uuid().optional(),
  eventType: z.enum(["goal", "card", "substitution", "point", "foul", "timeout", "other"]),
  minute: z.number().int().min(0).max(200).optional(),
  description: z.string().trim().max(500).optional(),
});

export type MatchEventInput = z.infer<typeof matchEventSchema>;
