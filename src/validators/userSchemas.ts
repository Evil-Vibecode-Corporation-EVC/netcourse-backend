import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(8),
    username: z.string(),
    avatarUrl: z.string().optional(),
    bio: z.string().max(500).optional(),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>["body"];

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    email: z.email().optional(),
    username: z.string().optional(),
    avatarUrl: z.string().optional(),
    password: z.string().optional(),
    bio: z.string().max(500).optional(),
  }),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
