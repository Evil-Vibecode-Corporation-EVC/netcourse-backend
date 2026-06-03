import { Request, Response } from "express";
import { db } from "../drizzle/db";
import { enrollments, courses, subscriptions } from "../drizzle/schema";
import { eq, and, gt } from "drizzle-orm";
import { sanitizeUserPublic } from "../utils/userPublicFields";

export const createEnrollment = async (req: Request, res: Response) => {
  try {
    const { userId } = (req as any).validated.body;
    const { courseId } = req.params;

    const currentUser = (req as any).user;

    if (currentUser.role !== "ADMIN" && currentUser.id !== Number(userId)) {
      return res
        .status(403)
        .json({ error: "forbidden: you can only enroll yourself" });
    }

    const course = await db.query.courses.findFirst({
      where: eq(courses.id, Number(courseId)),
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (course.price != null) {
      const sub = await db.query.subscriptions.findFirst({
        where: and(
          eq(subscriptions.userId, Number(userId)),
          eq(subscriptions.status, "active"),
          gt(subscriptions.expiresAt, new Date()),
        ),
      });

      if (!sub) {
        return res.status(403).json({
          error: "Active subscription required to enroll in paid courses",
        });
      }
    }

    const [enrollment] = await db.insert(enrollments).values({
      userId: Number(userId),
      courseId: Number(courseId),
    }).returning();

    res.status(201).json(enrollment);
  } catch (error: any) {
    if (error?.code === "23505") {
      return res.status(409).json({ error: "User is already enrolled in this course" });
    }
    res.status(500).json({ error: "Failed to create enrollment" });
  }
};

export const getEnrollments = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const currentUser = (req as any).user;

    const enrollmentsList =
      currentUser.role === "ADMIN"
        ? await db.query.enrollments.findMany({
            where: eq(enrollments.courseId, Number(courseId)),
            with: { user: true },
          })
        : await db.query.enrollments.findMany({
            where: and(
              eq(enrollments.courseId, Number(courseId)),
              eq(enrollments.userId, currentUser.id)
            ),
            with: { user: true },
          });

    res.json(
      enrollmentsList.map((enrollment) => ({
        ...enrollment,
        user: sanitizeUserPublic(enrollment.user),
      })),
    );
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch enrollments" });
  }
};

export const deleteEnrollment = async (req: Request, res: Response) => {
  try {
    const { enrollmentId } = req.params;
    const currentUser = (req as any).user;

    const enrollment = await db.query.enrollments.findFirst({
      where: eq(enrollments.id, Number(enrollmentId)),
    });

    if (!enrollment) {
      return res.status(404).json({ error: "enrollment not found" });
    }

    if (currentUser.role !== "ADMIN" && currentUser.id !== enrollment.userId) {
      return res
        .status(403)
        .json({ error: "forbidden: you can only delete your own enrollment" });
    }

    await db.delete(enrollments)
      .where(eq(enrollments.id, Number(enrollmentId)));

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete enrollment" });
  }
};
