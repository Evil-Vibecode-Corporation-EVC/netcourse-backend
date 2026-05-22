import { z } from "zod";

export const createForumPostSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200),
    body: z.string().min(1),
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
    title: z.string().min(3).max(200).optional(),
    body: z.string().min(1).optional(),
    tags: z.array(z.string().min(1).max(50)).max(20).optional(),
    courseId: z.number().int().positive().optional(),
  }),
});

export type UpdateForumPostInput = z.infer<typeof updateForumPostSchema>["body"];
