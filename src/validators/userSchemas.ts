import { z } from "zod";
import { containsProfanity } from "../utils/profanity";

const noProfanity = (label: string) =>
  (val: string, ctx: z.RefinementCtx) => {
    if (containsProfanity(val)) {
      ctx.addIssue({ code: "custom", message: `${label} contains inappropriate language` });
    }
  };

export const createUserSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(8),
    username: z.string().superRefine(noProfanity("Username")),
    avatarUrl: z.string().optional(),
    bio: z.string().max(500).optional().superRefine(noProfanity("Bio")),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>["body"];

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    email: z.email().optional(),
    username: z.string().optional().superRefine(noProfanity("Username")),
    avatarUrl: z.string().optional(),
    password: z.string().optional(),
    bio: z.string().max(500).optional().superRefine(noProfanity("Bio")),
  }),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
