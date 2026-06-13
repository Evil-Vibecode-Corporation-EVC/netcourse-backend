import { Request, Response } from "express";
import { db } from "../drizzle/db";
import {
  users,
  forumPosts,
  forumReplies,
} from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { sanitizeUserPrivate, sanitizeUserPublic } from "../utils/userPublicFields";

const sanitizeUserWithRelations = (user: any) => {
  if (!user) return user;

  const { enrollments, progresses } = user;

  return {
    ...sanitizeUserPrivate(user),
    enrollments,
    progresses,
  };
};

const buildPublicProfileResponse = async (user: any) => {
  const [postsCountResult, repliesCountResult] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(forumPosts)
      .where(eq(forumPosts.userId, user.id)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(forumReplies)
      .where(eq(forumReplies.userId, user.id)),
  ]);

  return {
    ...sanitizeUserPublic(user),
    socialLinks: (user.socialLinks || []).map((link: any) => ({
      id: link.id,
      platform: link.platform,
      url: link.url,
    })),
    certifications: (user.certifications || []).map((cert: any) => ({
      id: cert.id,
      issuedAt: cert.issuedAt,
      course: cert.course
        ? {
            id: cert.course.id,
            title: cert.course.title,
            category: cert.course.category,
          }
        : null,
    })),
    stats: {
      postsCount: Number(postsCountResult?.[0]?.count || 0),
      repliesCount: Number(repliesCountResult?.[0]?.count || 0),
    },
  };
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, username, avatarUrl, bio } = (req as any).validated
      .body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const [user] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        username,
        avatarUrl,
        bio,
      })
      .returning();

    res.status(201).json(sanitizeUserWithRelations(user));
  } catch (error: any) {
    console.error("Error creating user:", error);

    if (error?.code === "23505" || error?.message?.includes("unique")) {
      if (error?.constraint === "users_username_key") {
        return res.status(409).json({ error: "Username is already taken" });
      }
      return res
        .status(409)
        .json({ error: "User with this email already exists" });
    }

    res.status(500).json({ error: "Failed to create user" });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const usersList = await db.query.users.findMany({
      with: {
        enrollments: true,
        progresses: true,
      },
    });

    res.json(usersList.map((user) => sanitizeUserWithRelations(user)));
  } catch (error) {
    res.status(500).json({ error: "failed to fetch users" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { email, password, username, avatarUrl, bio } = (req as any).validated
      .body;
    const { id } = req.params;
    const currentUser = (req as any).user;

    const targetUserId = Number(id);

    if (currentUser.role !== "ADMIN" && currentUser.id !== targetUserId) {
      return res
        .status(403)
        .json({ error: "forbidden: you can only update your own account" });
    }

    const updateData: any = {};
    if (email !== undefined) updateData.email = email;
    if (username !== undefined) updateData.username = username;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (bio !== undefined) updateData.bio = bio;

    if (password !== undefined) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, targetUserId))
      .returning();

    res.json(sanitizeUserWithRelations(user));
  } catch (error: any) {
    if (error?.code === "23505" || error?.message?.includes("unique")) {
      if (error?.constraint === "users_username_key") {
        return res.status(409).json({ error: "Username is already taken" });
      }
      return res.status(409).json({ error: "Email is already in use" });
    }
    res.status(500).json({ error: "failed to update user" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;

    const targetUserId = Number(id);

    if (currentUser.role !== "ADMIN" && currentUser.id !== targetUserId) {
      return res
        .status(403)
        .json({ error: "forbidden: you can only delete your own account" });
    }

    await db.delete(users).where(eq(users.id, targetUserId));

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "failed to delete user" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;

    const targetUserId = Number(id);

    if (currentUser.role !== "ADMIN" && currentUser.id !== targetUserId) {
      return res
        .status(403)
        .json({ error: "forbidden: you can only view your own account" });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, targetUserId),
      with: {
        enrollments: true,
        progresses: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    res.json(sanitizeUserWithRelations(user));
  } catch (error) {
    res.status(500).json({ error: "failed to fetch user" });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;

    const user = await db.query.users.findFirst({
      where: eq(users.id, currentUser.id),
      with: {
        enrollments: true,
        progresses: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    res.json(sanitizeUserWithRelations(user));
  } catch (error) {
    res.status(500).json({ error: "failed to fetch user" });
  }
};

export const getPublicProfileById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const targetUserId = Number(id);

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return res.status(400).json({ error: "invalid user id" });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, targetUserId),
      with: {
        socialLinks: true,
        certifications: {
          with: {
            course: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    res.json(await buildPublicProfileResponse(user));
  } catch (error) {
    res.status(500).json({ error: "failed to fetch public profile" });
  }
};

export const getPublicProfileByUsername = async (
  req: Request,
  res: Response,
) => {
  try {
    const username = String(req.params.username || "").trim();

    if (!username) {
      return res.status(400).json({ error: "username is required" });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
      with: {
        socialLinks: true,
        certifications: {
          with: {
            course: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    res.json(await buildPublicProfileResponse(user));
  } catch (error) {
    res.status(500).json({ error: "failed to fetch public profile" });
  }
};
