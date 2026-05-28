import { Request, Response } from "express";
import { db } from "../drizzle/db";
import { lessons } from "../drizzle/schema";
import { eq, asc, and } from "drizzle-orm";

export const createLesson = async (req: Request, res: Response) => {
  try {
    const { sectionId } = req.params;
    const { title, contentType, videoUrl, textContent, orderIndex } = (
      req as any
    ).validated.body;

    const [lesson] = await db
      .insert(lessons)
      .values({
        sectionId: Number(sectionId),
        title,
        contentType,
        videoUrl,
        textContent,
        orderIndex,
      })
      .returning();

    const lessonWithRelations = await db.query.lessons.findFirst({
      where: eq(lessons.id, lesson.id),
      with: {
        section: true,
        quizzes: true,
      },
    });

    res.status(201).json(lessonWithRelations);
  } catch (error) {
    console.error("[lessonController] createLesson error:", error);
    res.status(500).json({ error: "Failed to create lesson" });
  }
};

export const getAllLessons = async (req: Request, res: Response) => {
  try {
    const { sectionId } = req.params;

    const lessonsList = await db.query.lessons.findMany({
      where: eq(lessons.sectionId, Number(sectionId)),
      with: {
        section: true,
        quizzes: true,
      },
      orderBy: asc(lessons.orderIndex),
    });

    res.json(lessonsList);
  } catch (error) {
    console.error("[lessonController] getAllLessons error:", error);
    res.status(500).json({ error: "Failed to fetch lessons" });
  }
};

export const getLessonById = async (req: Request, res: Response) => {
  try {
    const { id, sectionId } = req.params;

    const lesson = await db.query.lessons.findFirst({
      where: and(
        eq(lessons.id, Number(id)),
        eq(lessons.sectionId, Number(sectionId)),
      ),
      with: {
        section: true,
        quizzes: true,
      },
    });

    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    res.json(lesson);
  } catch (error) {
    console.error("[lessonController] getLessonById error:", error);
    res.status(500).json({ error: "Failed to fetch lesson" });
  }
};

export const updateLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, contentType, videoUrl, textContent, orderIndex } = (
      req as any
    ).validated.body;

    const [updated] = await db
      .update(lessons)
      .set({ title, contentType, videoUrl, textContent, orderIndex })
      .where(eq(lessons.id, Number(id)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    const updatedWithRelations = await db.query.lessons.findFirst({
      where: eq(lessons.id, updated.id),
      with: {
        section: true,
        quizzes: true,
      },
    });

    res.json(updatedWithRelations);
  } catch (error) {
    console.error("[lessonController] updateLesson error:", error);
    res.status(500).json({ error: "Failed to update lesson" });
  }
};

export const deleteLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await db.delete(lessons).where(eq(lessons.id, Number(id)));

    res.status(204).send();
  } catch (error) {
    console.error("[lessonController] deleteLesson error:", error);
    res.status(500).json({ error: "Failed to delete lesson" });
  }
};
