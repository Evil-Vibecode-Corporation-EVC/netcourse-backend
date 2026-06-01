import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(8),
    username: z.string().optional(),
    avatarUrl: z.string().optional(),
    bio: z.string().max(500).optional(),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];

export const loginSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string(),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>["body"];

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.email(),
  }),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>["body"];

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z.string().min(8),
  }),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>["body"];
