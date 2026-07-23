import { z } from "zod";

export const createPaymentSchema = z.object({
  organizerId: z.string().uuid(),
  rentalPlanId: z.string().uuid(),
  tournamentId: z.string().uuid().optional(),
  couponCode: z.string().trim().toUpperCase().max(30).optional(),
  gateway: z.enum(["razorpay", "stripe"]),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export const paymentWebhookSchema = z.object({
  gateway: z.enum(["razorpay", "stripe"]),
  eventType: z.string().min(1),
  paymentGatewayRef: z.string().min(1),
  signature: z.string().min(1),
  payload: z.record(z.unknown()),
});

export type PaymentWebhookInput = z.infer<typeof paymentWebhookSchema>;
