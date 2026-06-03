import { Request, Response, NextFunction } from "express";
import { db } from "../drizzle/db";
import { courses, subscriptions } from "../drizzle/schema";
import { eq, and, gt } from "drizzle-orm";

export const requireActiveSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const courseId =
      Number(req.params.courseId || req.body.courseId) ||
      Number(req.query.courseId);

    if (!courseId) {
      return next();
    }

    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
    });

    if (!course || course.price == null) {
      return next();
    }

    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const sub = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active"),
        gt(subscriptions.expiresAt, new Date()),
      ),
    });

    if (!sub) {
      return res.status(403).json({
        error: "Active subscription required to access this course content",
      });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to verify subscription" });
  }
};
