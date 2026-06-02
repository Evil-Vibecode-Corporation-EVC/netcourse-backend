import { z } from "zod";

export const createCourseSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    price: z.number().int().min(0).optional().nullable(),
    requireQuizCompletion: z.boolean().optional(),
    minQuizScore: z.number().int().min(0).max(100).optional(),
  }),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>["body"];

export const updateCourseSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    title: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    price: z.number().int().min(0).optional().nullable(),
    requireQuizCompletion: z.boolean().optional(),
    minQuizScore: z.number().int().min(0).max(100).optional(),
  }),
});

export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
