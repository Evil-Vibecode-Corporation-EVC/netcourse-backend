import { z } from "zod";

export const deepseekChatSchema = z.object({
  body: z.object({
    message: z.string().min(1).max(4000),
  }),
});

export type DeepseekChatInput = z.infer<typeof deepseekChatSchema>["body"];
