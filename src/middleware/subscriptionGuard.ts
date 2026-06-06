import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../drizzle/db";
import { courses, subscriptions } from "../drizzle/schema";
import { eq, and, gt } from "drizzle-orm";

const SECRET = process.env.JWT_SECRET;

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

    let userId = (req as any).user?.id;

    if (!userId) {
      const header = req.headers.authorization;
      if (header?.startsWith("Bearer ")) {
        const token = header.split(" ")[1];
        try {
          const decoded = jwt.verify(token, SECRET!) as { id: number };
          userId = decoded.id;
          (req as any).user = { ...(req as any).user, id: decoded.id };
        } catch {
          return res.status(401).json({ error: "Invalid token" });
        }
      } else {
        return res.status(401).json({ error: "Unauthorized" });
      }
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
