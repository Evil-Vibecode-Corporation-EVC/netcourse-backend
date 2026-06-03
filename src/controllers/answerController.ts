import { Request, Response } from "express";
import { db } from "../drizzle/db";
import { answers } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const createAnswer = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;
    const { answerText, isCorrect } = (req as any).validated.body;

    const [answer] = await db
      .insert(answers)
      .values({
        questionId: Number(questionId),
        answerText,
        isCorrect,
      })
      .returning();

    res.status(201).json(answer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create answer" });
  }
};

export const getAllAnswers = async (req: Request, res: Response) => {
  try {
    const answersList = await db.query.answers.findMany({
      with: { question: true },
    });

    res.json(answersList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch answers" });
  }
};

export const getAnswerById = async (req: Request, res: Response) => {
  try {
    const { id, questionId } = req.params;

    const answer = await db.query.answers.findFirst({
      where: and(
        eq(answers.id, Number(id)),
        eq(answers.questionId, Number(questionId)),
      ),
      with: { question: true },
    });

    if (!answer) return res.status(404).json({ error: "Answer not found" });

    res.json(answer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch answer" });
  }
};

export const updateAnswer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { answerText, isCorrect } = (req as any).validated.body;

    const [updated] = await db
      .update(answers)
      .set({ answerText, isCorrect })
      .where(eq(answers.id, Number(id)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Answer not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update answer" });
  }
};

export const deleteAnswer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await db.delete(answers).where(eq(answers.id, Number(id)));

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete answer" });
  }
};
