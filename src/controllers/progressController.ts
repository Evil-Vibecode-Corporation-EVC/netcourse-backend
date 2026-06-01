import { Request, Response } from "express";
import { db } from "../drizzle/db";
import {
  progress,
  certifications,
  badges,
  userBadges,
  courses,
  enrollments,
  sections,
  lessons,
  quizzes,
  quizAttempts,
} from "../drizzle/schema";
import { eq, and, inArray, gte } from "drizzle-orm";
import { randomBytes } from "crypto";
import { sanitizeUserPublic } from "../utils/userPublicFields";

const awardOnCompletion = async (userId: number, courseId: number) => {
  const enrollment = await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.userId, userId),
      eq(enrollments.courseId, courseId)
    ),
  });

  if (!enrollment) {
    return;
  }

  const existingCert = await db.query.certifications.findFirst({
    where: and(
      eq(certifications.userId, userId),
      eq(certifications.courseId, courseId)
    ),
  });

  if (!existingCert) {
    await db.insert(certifications).values({
      userId,
      courseId,
      certificateCode: randomBytes(8).toString("hex"),
    });
  }

  const badge = await db.query.badges.findFirst({
    where: eq(badges.courseId, courseId),
  });

  if (badge) {
    const existingBadge = await db.query.userBadges.findFirst({
      where: and(
        eq(userBadges.userId, userId),
        eq(userBadges.badgeId, badge.id)
      ),
    });

    if (!existingBadge) {
      await db.insert(userBadges).values({ userId, badgeId: badge.id });
    }
  }
};

const ensureQuizCompletion = async (userId: number, courseId: number) => {
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  });

  if (!course || !course.requireQuizCompletion) {
    return { ok: true } as const;
  }

  const courseSections = await db.query.sections.findMany({
    where: eq(sections.courseId, courseId),
  });

  const sectionIds = courseSections.map((section) => section.id);
  if (sectionIds.length === 0) {
    return { ok: true } as const;
  }

  const courseLessons = await db.query.lessons.findMany({
    where: inArray(lessons.sectionId, sectionIds),
  });

  const lessonIds = courseLessons.map((lesson) => lesson.id);
  if (lessonIds.length === 0) {
    return { ok: true } as const;
  }

  const courseQuizzes = await db.query.quizzes.findMany({
    where: inArray(quizzes.lessonId, lessonIds),
  });

  const quizIds = courseQuizzes.map((quiz) => quiz.id);
  if (quizIds.length === 0) {
    return { ok: true } as const;
  }

  const passed = await db
    .select({ quizId: quizAttempts.quizId })
    .from(quizAttempts)
    .where(
      and(
        eq(quizAttempts.userId, userId),
        gte(quizAttempts.score, course.minQuizScore),
        inArray(quizAttempts.quizId, quizIds),
      ),
    )
    .groupBy(quizAttempts.quizId);

  const passedIds = new Set(passed.map((item) => item.quizId));
  const missingQuizIds = quizIds.filter((id) => !passedIds.has(id));

  if (missingQuizIds.length > 0) {
    return {
      ok: false,
      missingQuizIds,
      minScore: course.minQuizScore,
    } as const;
  }

  return { ok: true } as const;
};

const ensureEnrollment = async (userId: number, courseId: number) => {
  const enrollment = await db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.userId, userId),
      eq(enrollments.courseId, courseId)
    ),
  });

  return Boolean(enrollment);
};

const ensureCourseExists = async (courseId: number) => {
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  });

  return Boolean(course);
};

export const getUserProgress = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = (req as any).user.id;

    const userProgress = await db.query.progress.findFirst({
      where: and(
        eq(progress.userId, userId),
        eq(progress.courseId, Number(courseId))
      ),
    });

    if (!userProgress) return res.json({ status: "not_started" });

    res.json(userProgress);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch progress" });
  }
};

export const updateUserProgress = async (req: Request, res: Response) => {
  try {
    const courseId = Number((req as any).validated.params.courseId);
    const { status } = (req as any).validated.body;
    const userId = (req as any).user.id;

    const courseExists = await ensureCourseExists(courseId);
    if (!courseExists) {
      return res.status(404).json({ error: "Course not found" });
    }

    const isEnrolled = await ensureEnrollment(userId, courseId);
    if (!isEnrolled) {
      return res.status(403).json({ error: "User is not enrolled in this course" });
    }

    if (status === "completed") {
      const result = await ensureQuizCompletion(userId, courseId);
      if (!result.ok) {
        return res.status(409).json({
          error: "Complete all quizzes before finishing the course",
          missingQuizIds: result.missingQuizIds,
          minScore: result.minScore,
        });
      }
    }

    const existing = await db.query.progress.findFirst({
      where: and(
        eq(progress.userId, userId),
        eq(progress.courseId, courseId)
      ),
    });

    let result;
    if (existing) {
      [result] = await db.update(progress)
        .set({ status, updatedAt: new Date() })
        .where(and(
          eq(progress.userId, userId),
          eq(progress.courseId, courseId)
        ))
        .returning();
    } else {
      [result] = await db.insert(progress)
        .values({ userId, courseId, status })
        .returning();
    }

    if (status === "completed") {
      await awardOnCompletion(userId, courseId);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to update progress" });
  }
};

export const getAllCourseProgress = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    const progressList = await db.query.progress.findMany({
      where: eq(progress.courseId, Number(courseId)),
      with: { user: true },
    });

    res.json(
      progressList.map((item) => ({
        ...item,
        user: sanitizeUserPublic(item.user),
      })),
    );
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch progress" });
  }
};

export const getUserProgressAdmin = async (req: Request, res: Response) => {
  try {
    const { userId, courseId } = req.params;

    const userProgress = await db.query.progress.findFirst({
      where: and(
        eq(progress.userId, Number(userId)),
        eq(progress.courseId, Number(courseId))
      ),
    });

    if (!userProgress) return res.json({ status: "not_started" });

    res.json(userProgress);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch progress" });
  }
};

export const updateUserProgressAdmin = async (req: Request, res: Response) => {
  try {
    const { courseId, userId } = req.params;
    const { status } = (req as any).validated.body;

    const courseExists = await ensureCourseExists(Number(courseId));
    if (!courseExists) {
      return res.status(404).json({ error: "Course not found" });
    }

    const isEnrolled = await ensureEnrollment(Number(userId), Number(courseId));
    if (!isEnrolled) {
      return res.status(403).json({ error: "User is not enrolled in this course" });
    }

    if (status === "completed") {
      const result = await ensureQuizCompletion(Number(userId), Number(courseId));
      if (!result.ok) {
        return res.status(409).json({
          error: "Complete all quizzes before finishing the course",
          missingQuizIds: result.missingQuizIds,
          minScore: result.minScore,
        });
      }
    }

    const existing = await db.query.progress.findFirst({
      where: and(
        eq(progress.userId, Number(userId)),
        eq(progress.courseId, Number(courseId))
      ),
    });

    let result;
    if (existing) {
      [result] = await db.update(progress)
        .set({ status, updatedAt: new Date() })
        .where(and(
          eq(progress.userId, Number(userId)),
          eq(progress.courseId, Number(courseId))
        ))
        .returning();
    } else {
      [result] = await db.insert(progress)
        .values({
          userId: Number(userId),
          courseId: Number(courseId),
          status,
        })
        .returning();
    }

    if (status === "completed") {
      await awardOnCompletion(Number(userId), Number(courseId));
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to update progress" });
  }
};
