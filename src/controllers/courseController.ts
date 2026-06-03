import { Request, Response } from "express";
import { db } from "../drizzle/db";
import { courses, courseRatings } from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";

export const createCourse = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      price,
      requireQuizCompletion,
      minQuizScore,
    } = (req as any).validated.body;

    const [course] = await db
      .insert(courses)
      .values({
        title,
        description,
        category,
        price,
        requireQuizCompletion,
        minQuizScore,
      })
      .returning();

    res.status(201).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create course" });
  }
};

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const coursesList = await db.query.courses.findMany({
      with: {
        enrollments: true,
        sections: true,
      },
    });

    const ratings = await db
      .select({
        courseId: courseRatings.courseId,
        average: sql<number>`avg(${courseRatings.rating})`,
        count: sql<number>`count(*)`,
      })
      .from(courseRatings)
      .groupBy(courseRatings.courseId);

    const ratingsMap = new Map(
      ratings.map((row) => [
        row.courseId,
        {
          count: Number(row.count ?? 0),
          average: Number(row.average ?? 0),
        },
      ]),
    );

    res.json(
      coursesList.map((course) => {
        const rating = ratingsMap.get(course.id);
        const count = rating?.count ?? 0;
        const average = count > 0 ? rating?.average ?? 0 : null;

        return {
          ...course,
          averageRating: average,
          ratingsCount: count,
        };
      }),
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const course = await db.query.courses.findFirst({
      where: eq(courses.id, Number(id)),
      with: {
        enrollments: true,
        sections: true,
      },
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const [rating] = await db
      .select({
        average: sql<number>`avg(${courseRatings.rating})`,
        count: sql<number>`count(*)`,
      })
      .from(courseRatings)
      .where(eq(courseRatings.courseId, Number(id)));

    const count = Number(rating?.count ?? 0);
    const average = count > 0 ? Number(rating?.average ?? 0) : null;

    res.json({
      ...course,
      averageRating: average,
      ratingsCount: count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch course" });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      price,
      requireQuizCompletion,
      minQuizScore,
    } = (req as any).validated.body;

    const [updated] = await db
      .update(courses)
      .set({
        title,
        description,
        category,
        price,
        requireQuizCompletion,
        minQuizScore,
      })
      .where(eq(courses.id, Number(id)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update course" });
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [existing] = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.id, Number(id)))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "Course not found" });
    }

    await db.delete(courses).where(eq(courses.id, Number(id)));

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete course" });
  }
};
