import { Request, Response } from "express";
import { db } from "../drizzle/db";
import { quizzes, answers, quizAttempts } from "../drizzle/schema";
import { eq, inArray, and } from "drizzle-orm";

export const createQuiz = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const { title } = (req as any).validated.body;

    const [quiz] = await db
      .insert(quizzes)
      .values({
        lessonId: Number(lessonId),
        title,
      })
      .returning();

    res.status(201).json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create quiz" });
  }
};

export const getAllQuizzes = async (req: Request, res: Response) => {
  try {
    const { courseId, sectionId, lessonId } = req.params;

    const quizzesList = await db.query.quizzes.findMany({
      where: eq(quizzes.lessonId, Number(lessonId)),
      with: {
        lesson: true,
        questions: true,
      },
    });

    res.json(quizzesList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
};

export const getQuizById = async (req: Request, res: Response) => {
  try {
    const { id, lessonId } = req.params;

    const quiz = await db.query.quizzes.findFirst({
      where: and(
        eq(quizzes.id, Number(id)),
        eq(quizzes.lessonId, Number(lessonId)),
      ),
      with: {
        lesson: true,
        questions: {
          with: { answers: true },
        },
      },
    });

    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    res.json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch quiz" });
  }
};

export const submitQuizAttempt = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { answers: submittedAnswers } = (req as any).validated.body;
    const userId = (req as any).user.id;

    const quiz = await db.query.quizzes.findFirst({
      where: eq(quizzes.id, Number(id)),
      with: {
        lesson: {
          with: {
            section: {
              with: {
                course: true,
              },
            },
          },
        },
        questions: true,
      },
    });

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const questionIds = quiz.questions.map((q) => q.id);
    if (questionIds.length === 0) {
      return res.status(400).json({ error: "Quiz has no questions" });
    }

    const eligibleQuestions = quiz.questions.filter(
      (q) => q.questionType !== "text",
    );
    if (eligibleQuestions.length === 0) {
      return res.status(400).json({ error: "Quiz has no gradable questions" });
    }

    const answersByQuestion = new Map<number, number[]>();
    (submittedAnswers || []).forEach((entry: any) => {
      if (questionIds.includes(entry.questionId)) {
        answersByQuestion.set(entry.questionId, entry.answerIds || []);
      }
    });

    const correctAnswers = await db.query.answers.findMany({
      where: and(
        eq(answers.isCorrect, true),
        inArray(answers.questionId, eligibleQuestions.map((q) => q.id)),
      ),
    });

    const correctMap = new Map<number, number[]>();
    correctAnswers.forEach((answer) => {
      const list = correctMap.get(answer.questionId) ?? [];
      list.push(answer.id);
      correctMap.set(answer.questionId, list);
    });

    let correctCount = 0;
    eligibleQuestions.forEach((question) => {
    const submitted = new Set(
      (answersByQuestion.get(question.id) ?? []).map((id) => Number(id)),
    );
    const correct = new Set(correctMap.get(question.id) ?? []);

    if (submitted.size !== correct.size) return;

    for (const id of submitted) {
      if (!correct.has(id)) return;
    }
    correctCount += 1;
  });

    const totalCount = eligibleQuestions.length;
    const score = Math.round((correctCount / totalCount) * 100);
    const course = quiz.lesson?.section?.course;
    const minScore = course?.minQuizScore ?? 65;
    const passed = score >= minScore;

    const [attempt] = await db
      .insert(quizAttempts)
      .values({
        userId,
        quizId: Number(id),
        score,
        passed,
      })
      .returning();

    res.json({
      attemptId: attempt.id,
      score,
      passed,
      correctCount,
      totalCount,
      minScore,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to submit quiz attempt" });
  }
};

export const updateQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title } = (req as any).validated.body;

    const [updated] = await db
      .update(quizzes)
      .set({ title })
      .where(eq(quizzes.id, Number(id)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update quiz" });
  }
};

export const deleteQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await db.delete(quizzes).where(eq(quizzes.id, Number(id)));

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete quiz" });
  }
};
