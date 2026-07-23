import { z } from "zod";

export const rentalDurationEnum = z.enum(["1_day", "3_day", "1_week", "2_week", "1_month", "unlimited"]);

export const rentalPlanSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  duration: rentalDurationEnum,
  priceCents: z.number().int().nonnegative(),
  currency: z.string().length(3).default("INR"),
  features: z.array(z.string()).default([]),
  maxTeams: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export type RentalPlanInput = z.infer<typeof rentalPlanSchema>;
