import { Request, Response } from "express";
import { db } from "../drizzle/db";
import {
  forumPosts,
  forumReplies,
  forumTags,
  forumReplyTags,
  forumReplyLikes,
  forumReplyAttachments,
} from "../drizzle/schema";
import { eq, asc, sql, inArray, and } from "drizzle-orm";
import { sanitizeUserPublic } from "../utils/userPublicFields";

const normalizeTags = (tags?: string[]) => {
  if (!tags?.length) {
    return [];
  }
  const normalized = tags
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0)
    .slice(0, 20);
  return Array.from(new Set(normalized));
};

const upsertTags = async (tags: string[]) => {
  if (tags.length === 0) {
    return [] as { id: number; name: string }[];
  }

  const existing = await db
    .select({ id: forumTags.id, name: forumTags.name })
    .from(forumTags)
    .where(inArray(forumTags.name, tags));

  const existingNames = new Set(existing.map((tag) => tag.name));
  const newNames = tags.filter((tag) => !existingNames.has(tag));

  let inserted: { id: number; name: string }[] = [];
  if (newNames.length > 0) {
    inserted = await db
      .insert(forumTags)
      .values(newNames.map((name) => ({ name })))
      .returning({ id: forumTags.id, name: forumTags.name });
  }

  return [...existing, ...inserted];
};

const getReplyTagsMap = async (replyIds: number[]) => {
  if (replyIds.length === 0) {
    return new Map<number, string[]>();
  }

  const rows = await db
    .select({ replyId: forumReplyTags.replyId, tagName: forumTags.name })
    .from(forumReplyTags)
    .innerJoin(forumTags, eq(forumReplyTags.tagId, forumTags.id))
    .where(inArray(forumReplyTags.replyId, replyIds));

  const map = new Map<number, string[]>();
  rows.forEach((row) => {
    const list = map.get(row.replyId) ?? [];
    list.push(row.tagName);
    map.set(row.replyId, list);
  });
  return map;
};

const getReplyLikesMap = async (replyIds: number[]) => {
  if (replyIds.length === 0) {
    return new Map<number, number>();
  }

  const rows = await db
    .select({ replyId: forumReplyLikes.replyId, count: sql<number>`count(*)` })
    .from(forumReplyLikes)
    .where(inArray(forumReplyLikes.replyId, replyIds))
    .groupBy(forumReplyLikes.replyId);

  const map = new Map<number, number>();
  rows.forEach((row) => {
    map.set(row.replyId, Number(row.count));
  });
  return map;
};

export const createForumReply = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { postId } = req.params;
    const { body, tags } = (req as any).validated.body;
    const normalizedTags = normalizeTags(tags);

    const post = await db.query.forumPosts.findFirst({
      where: eq(forumPosts.id, Number(postId)),
    });

    if (!post) {
      return res.status(404).json({ error: "Forum post not found" });
    }

    const [reply] = await db
      .insert(forumReplies)
      .values({
        postId: Number(postId),
        userId,
        body,
      })
      .returning();

    if (normalizedTags.length > 0) {
      const tagRows = await upsertTags(normalizedTags);
      if (tagRows.length > 0) {
        await db.insert(forumReplyTags).values(
          tagRows.map((tag) => ({
            replyId: reply.id,
            tagId: tag.id,
          })),
        );
      }
    }

    const replyWithRelations = await db.query.forumReplies.findFirst({
      where: eq(forumReplies.id, reply.id),
      with: {
        user: true,
        post: true,
        attachments: true,
      },
    });

    if (!replyWithRelations) {
      return res.status(201).json(reply);
    }

    const replyTagsMap = await getReplyTagsMap([replyWithRelations.id]);
    const replyLikesMap = await getReplyLikesMap([replyWithRelations.id]);

    res.status(201).json({
      ...replyWithRelations,
      user: sanitizeUserPublic(replyWithRelations.user),
      tags: replyTagsMap.get(replyWithRelations.id) ?? [],
      likesCount: replyLikesMap.get(replyWithRelations.id) ?? 0,
    });
  } catch (error) {
    console.error("[forumReplyController] createForumReply error:", error);
    res.status(500).json({ error: "Failed to create forum reply" });
  }
};

export const getForumRepliesForPost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limitRaw = Number(req.query.limit) || 20;
    const limit = Math.min(Math.max(1, limitRaw), 100);
    const offset = (page - 1) * limit;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(forumReplies)
      .where(eq(forumReplies.postId, Number(postId)));
    const total = Number(countResult?.count ?? 0);
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    const replies = await db.query.forumReplies.findMany({
      where: eq(forumReplies.postId, Number(postId)),
      with: {
        user: true,
        attachments: true,
      },
      orderBy: asc(forumReplies.createdAt),
      limit,
      offset,
    });

    const replyIds = replies.map((reply) => reply.id);
    const replyTagsMap = await getReplyTagsMap(replyIds);
    const replyLikesMap = await getReplyLikesMap(replyIds);

    res.json({
      data: replies.map((reply) => ({
        ...reply,
        user: sanitizeUserPublic(reply.user),
        tags: replyTagsMap.get(reply.id) ?? [],
        likesCount: replyLikesMap.get(reply.id) ?? 0,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("[forumReplyController] getForumRepliesForPost error:", error);
    res.status(500).json({ error: "Failed to fetch forum replies" });
  }
};

export const updateForumReply = async (req: Request, res: Response) => {
  try {
    const { replyId } = req.params;
    const { body, tags } = (req as any).validated.body;
    const currentUser = (req as any).user;
    const normalizedTags = normalizeTags(tags);

    const existing = await db.query.forumReplies.findFirst({
      where: eq(forumReplies.id, Number(replyId)),
    });

    if (!existing) {
      return res.status(404).json({ error: "Forum reply not found" });
    }

    if (currentUser.role !== "ADMIN" && existing.userId !== currentUser.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const [updated] = await db
      .update(forumReplies)
      .set({
        body,
        updatedAt: new Date(),
      })
      .where(eq(forumReplies.id, Number(replyId)))
      .returning();

    if (tags) {
      await db
        .delete(forumReplyTags)
        .where(eq(forumReplyTags.replyId, Number(replyId)));

      if (normalizedTags.length > 0) {
        const tagRows = await upsertTags(normalizedTags);
        if (tagRows.length > 0) {
          await db.insert(forumReplyTags).values(
            tagRows.map((tag) => ({
              replyId: Number(replyId),
              tagId: tag.id,
            })),
          );
        }
      }
    }

    const updatedWithRelations = await db.query.forumReplies.findFirst({
      where: eq(forumReplies.id, updated.id),
      with: {
        user: true,
        post: true,
        attachments: true,
      },
    });

    if (!updatedWithRelations) {
      return res.json(updated);
    }

    const replyTagsMap = await getReplyTagsMap([updatedWithRelations.id]);
    const replyLikesMap = await getReplyLikesMap([updatedWithRelations.id]);

    res.json({
      ...updatedWithRelations,
      user: sanitizeUserPublic(updatedWithRelations.user),
      tags: replyTagsMap.get(updatedWithRelations.id) ?? [],
      likesCount: replyLikesMap.get(updatedWithRelations.id) ?? 0,
    });
  } catch (error) {
    console.error("[forumReplyController] updateForumReply error:", error);
    res.status(500).json({ error: "Failed to update forum reply" });
  }
};

export const likeForumReply = async (req: Request, res: Response) => {
  try {
    const { replyId } = req.params;
    const userId = (req as any).user.id;

    const reply = await db.query.forumReplies.findFirst({
      where: eq(forumReplies.id, Number(replyId)),
    });

    if (!reply) {
      return res.status(404).json({ error: "Forum reply not found" });
    }

    const existing = await db.query.forumReplyLikes.findFirst({
      where: and(
        eq(forumReplyLikes.replyId, Number(replyId)),
        eq(forumReplyLikes.userId, userId),
      ),
    });

    if (!existing) {
      await db.insert(forumReplyLikes).values({
        replyId: Number(replyId),
        userId,
      });
    }

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(forumReplyLikes)
      .where(eq(forumReplyLikes.replyId, Number(replyId)));

    res.json({
      replyId: Number(replyId),
      likesCount: Number(countRow?.count ?? 0),
    });
  } catch (error) {
    console.error("[forumReplyController] likeForumReply error:", error);
    res.status(500).json({ error: "Failed to like forum reply" });
  }
};

export const unlikeForumReply = async (req: Request, res: Response) => {
  try {
    const { replyId } = req.params;
    const userId = (req as any).user.id;

    const reply = await db.query.forumReplies.findFirst({
      where: eq(forumReplies.id, Number(replyId)),
    });

    if (!reply) {
      return res.status(404).json({ error: "Forum reply not found" });
    }

    await db
      .delete(forumReplyLikes)
      .where(
        and(
          eq(forumReplyLikes.replyId, Number(replyId)),
          eq(forumReplyLikes.userId, userId),
        ),
      );

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(forumReplyLikes)
      .where(eq(forumReplyLikes.replyId, Number(replyId)));

    res.json({
      replyId: Number(replyId),
      likesCount: Number(countRow?.count ?? 0),
    });
  } catch (error) {
    console.error("[forumReplyController] unlikeForumReply error:", error);
    res.status(500).json({ error: "Failed to unlike forum reply" });
  }
};

export const deleteForumReply = async (req: Request, res: Response) => {
  try {
    const { replyId } = req.params;
    const currentUser = (req as any).user;

    const existing = await db.query.forumReplies.findFirst({
      where: eq(forumReplies.id, Number(replyId)),
    });

    if (!existing) {
      return res.status(404).json({ error: "Forum reply not found" });
    }

    if (currentUser.role !== "ADMIN" && existing.userId !== currentUser.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await db.delete(forumReplies).where(eq(forumReplies.id, Number(replyId)));

    res.status(204).send();
  } catch (error) {
    console.error("[forumReplyController] deleteForumReply error:", error);
    res.status(500).json({ error: "Failed to delete forum reply" });
  }
};
