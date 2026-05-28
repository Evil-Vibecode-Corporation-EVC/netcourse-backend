import { Request, Response } from "express";
import { db } from "../drizzle/db";
import { questions } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const createQuestion = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;

    const { questionText, questionType } = (req as any).validated.body;

    const [question] = await db
      .insert(questions)
      .values({
        quizId: Number(quizId),
        questionText,
        questionType,
      })
      .returning();

    res.status(201).json(question);
  } catch {
    res.status(500).json({ error: "Failed to create question" });
  }
};

export const getAllQuestions = async (req: Request, res: Response) => {
  try {
    const { courseId, sectionId, lessonId, quizId } = req.params;

    const questionsList = await db.query.questions.findMany({
      where: eq(questions.quizId, Number(quizId)),
      with: {
        answers: true,
      },
    });

    res.json(questionsList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
};

export const getQuestionById = async (req: Request, res: Response) => {
  try {
    const { id, quizId } = req.params;

    const question = await db.query.questions.findFirst({
      where: and(
        eq(questions.id, Number(id)),
        eq(questions.quizId, Number(quizId)),
      ),
      with: {
        answers: true,
        quiz: true,
      },
    });

    if (!question) return res.status(404).json({ error: "Question not found" });

    res.json(question);
  } catch {
    res.status(500).json({ error: "Failed to fetch question" });
  }
};

export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { questionText, questionType } = (req as any).validated.body;

    const [updated] = await db
      .update(questions)
      .set({ questionText, questionType })
      .where(eq(questions.id, Number(id)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update question" });
  }
};

export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await db.delete(questions).where(eq(questions.id, Number(id)));

    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete question" });
  }
};
