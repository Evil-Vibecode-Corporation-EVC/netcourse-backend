import { Request, Response } from "express";
import path from "path";
import { db } from "../drizzle/db";
import { badges, userBadges } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { uploadFile, deleteFile, extractKeyFromUrl } from "../utils/r2";

// admin
export const createBadge = async (req: Request, res: Response) => {
  try {
    const { name, description, imageUrl, courseId } = (req as any).validated.body;

    const [badge] = await db.insert(badges).values({
      name,
      description,
      imageUrl,
      courseId: courseId ? Number(courseId) : null,
    }).returning();

    res.status(201).json(badge);
  } catch (error) {
    res.status(500).json({ error: "Failed to create badge" });
  }
};

export const getAllBadges = async (req: Request, res: Response) => {
  try {
    const badgeList = await db.query.badges.findMany({
      with: { course: true },
    });

    res.json(badgeList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch badges" });
  }
};

export const updateBadge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl, courseId } = (req as any).validated.body;

    const [updated] = await db.update(badges)
      .set({ name, description, imageUrl, courseId: courseId ? Number(courseId) : null })
      .where(eq(badges.id, Number(id)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Badge not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update badge" });
  }
};

export const deleteBadge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const badge = await db.query.badges.findFirst({
      where: eq(badges.id, Number(id)),
    });

    if (badge?.imageUrl) {
      const oldKey = extractKeyFromUrl(badge.imageUrl);
      if (oldKey) {
        deleteFile(oldKey).catch((err) =>
          console.error("Failed to delete badge image:", err),
        );
      }
    }

    await db.delete(badges).where(eq(badges.id, Number(id)));

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete badge" });
  }
};


export const getMyBadges = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const earned = await db.query.userBadges.findMany({
      where: eq(userBadges.userId, userId),
      with: { badge: true },
    });

    res.json(earned);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch badges" });
  }
};

export const getUserBadges = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const earned = await db.query.userBadges.findMany({
      where: eq(userBadges.userId, Number(userId)),
      with: { badge: true },
    });

    res.json(earned);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user badges" });
  }
};

export const uploadBadgeImage = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const { id } = req.params;
    const ext = path.extname(file.originalname) || ".jpg";
    const key = `badges/${id}-${Date.now()}${ext}`;

    const url = await uploadFile(key, file.buffer, file.mimetype);

    const badge = await db.query.badges.findFirst({
      where: eq(badges.id, Number(id)),
    });

    if (!badge) {
      await deleteFile(key);
      return res.status(404).json({ error: "Badge not found" });
    }

    if (badge.imageUrl) {
      const oldKey = extractKeyFromUrl(badge.imageUrl);
      if (oldKey) {
        deleteFile(oldKey).catch((err) =>
          console.error("Failed to delete old badge image:", err),
        );
      }
    }

    const [updated] = await db
      .update(badges)
      .set({ imageUrl: url })
      .where(eq(badges.id, Number(id)))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("Failed to upload badge image:", error);
    res.status(500).json({ error: "Failed to upload badge image" });
  }
};

export const deleteBadgeImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const badge = await db.query.badges.findFirst({
      where: eq(badges.id, Number(id)),
    });

    if (!badge) {
      return res.status(404).json({ error: "Badge not found" });
    }

    const oldKey = extractKeyFromUrl(badge.imageUrl);
    if (oldKey) {
      await deleteFile(oldKey);
    }

    const [updated] = await db
      .update(badges)
      .set({ imageUrl: null })
      .where(eq(badges.id, Number(id)))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("Failed to delete badge image:", error);
    res.status(500).json({ error: "Failed to delete badge image" });
  }
};