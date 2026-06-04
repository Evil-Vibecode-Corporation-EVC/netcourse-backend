import { Request, Response } from "express";
import path from "path";
import { db } from "../drizzle/db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { sanitizeUserPrivate } from "../utils/userPublicFields";
import { uploadFile, deleteFile, extractKeyFromUrl } from "../utils/r2";

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const userId = (req as any).user.id;
    const ext = path.extname(file.originalname) || ".jpg";
    const key = `avatars/${userId}-${Date.now()}${ext}`;

    const url = await uploadFile(key, file.buffer, file.mimetype);

    const oldUrl = await db
      .select({ avatarUrl: users.avatarUrl })
      .from(users)
      .where(eq(users.id, userId))
      .then((rows) => rows[0]?.avatarUrl);

    const [updated] = await db
      .update(users)
      .set({ avatarUrl: url })
      .where(eq(users.id, userId))
      .returning();

    if (oldUrl) {
      const oldKey = extractKeyFromUrl(oldUrl);
      if (oldKey) {
        deleteFile(oldKey).catch((err) =>
          console.error("Failed to delete old avatar:", err),
        );
      }
    }

    res.json(sanitizeUserPrivate(updated));
  } catch (error) {
    console.error("Failed to upload avatar:", error);
    res.status(500).json({ error: "Failed to upload avatar" });
  }
};

export const deleteAvatar = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const oldKey = extractKeyFromUrl(user.avatarUrl);
    if (oldKey) {
      await deleteFile(oldKey);
    }

    const [updated] = await db
      .update(users)
      .set({ avatarUrl: null })
      .where(eq(users.id, userId))
      .returning();

    res.json(sanitizeUserPrivate(updated));
  } catch (error) {
    console.error("Failed to delete avatar:", error);
    res.status(500).json({ error: "Failed to delete avatar" });
  }
};
