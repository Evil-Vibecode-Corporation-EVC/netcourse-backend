import { z } from "zod";
import { containsProfanity } from "../utils/profanity";

const noProfanity = (label: string) =>
  (val: string, ctx: z.RefinementCtx) => {
    if (containsProfanity(val)) {
      ctx.addIssue({ code: "custom", message: `${label} contains inappropriate language` });
    }
  };

export const createForumReplySchema = z.object({
  params: z.object({
    postId: z.string(),
  }),
  body: z.object({
    body: z.string().min(1).superRefine(noProfanity("Body")),
    tags: z.array(z.string().min(1).max(50)).max(20).optional(),
  }),
});

export type CreateForumReplyInput = z.infer<typeof createForumReplySchema>["body"];

export const updateForumReplySchema = z.object({
  params: z.object({
    replyId: z.string(),
  }),
  body: z.object({
    body: z.string().min(1).superRefine(noProfanity("Body")),
    tags: z.array(z.string().min(1).max(50)).max(20).optional(),
  }),
});

export type UpdateForumReplyInput = z.infer<typeof updateForumReplySchema>["body"];
