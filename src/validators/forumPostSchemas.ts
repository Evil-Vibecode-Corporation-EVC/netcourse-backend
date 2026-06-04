import { z } from "zod";
import { containsProfanity } from "../utils/profanity";

const noProfanity = (label: string) =>
  (val: string, ctx: z.RefinementCtx) => {
    if (containsProfanity(val)) {
      ctx.addIssue({ code: "custom", message: `${label} contains inappropriate language` });
    }
  };

export const createForumPostSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200).superRefine(noProfanity("Title")),
    body: z.string().min(1).superRefine(noProfanity("Body")),
    tags: z.array(z.string().min(1).max(50)).max(20).optional(),
    courseId: z.number().int().positive().optional(),
  }),
});

export type CreateForumPostInput = z.infer<typeof createForumPostSchema>["body"];

export const updateForumPostSchema = z.object({
  params: z.object({
    postId: z.string(),
  }),
  body: z.object({
    title: z.string().min(3).max(200).optional().superRefine(noProfanity("Title")),
    body: z.string().min(1).optional().superRefine(noProfanity("Body")),
    tags: z.array(z.string().min(1).max(50)).max(20).optional(),
    courseId: z.number().int().positive().optional(),
  }),
});

export type UpdateForumPostInput = z.infer<typeof updateForumPostSchema>["body"];
