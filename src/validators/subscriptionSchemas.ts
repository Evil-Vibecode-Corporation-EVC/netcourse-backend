import { z } from "zod";

export const createSubscriptionSchema = z.object({
  body: z.object({
    plan: z.enum(["monthly", "yearly"]),
    expiresAt: z.string().datetime().optional(),
  }),
});

export const selfSubscribeSchema = z.object({
  body: z.object({
    plan: z.enum(["monthly", "yearly"]),
  }),
});

export const updateSubscriptionSchema = z.object({
  params: z.object({
    id: z.string(),
    userId: z.string(),
  }),
  body: z.object({
    plan: z.enum(["monthly", "yearly"]).optional(),
    expiresAt: z.string().datetime().optional(),
    status: z.enum(["active", "expired", "cancelled"]).optional(),
  }),
});
