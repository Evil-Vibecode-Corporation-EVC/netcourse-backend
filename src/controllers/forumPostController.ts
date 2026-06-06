import { Request, Response } from "express";
import { db } from "../drizzle/db";
import {
  forumPosts,
  forumTags,
  forumPostTags,
  forumPostLikes,
  forumReplyTags,
  forumReplyLikes,
  forumPostAttachments,
} from "../drizzle/schema";
import { eq, desc, sql, inArray, and } from "drizzle-orm";
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

const getPostTagsMap = async (postIds: number[]) => {
  if (postIds.length === 0) {
    return new Map<number, string[]>();
  }

  const rows = await db
    .select({ postId: forumPostTags.postId, tagName: forumTags.name })
    .from(forumPostTags)
    .innerJoin(forumTags, eq(forumPostTags.tagId, forumTags.id))
    .where(inArray(forumPostTags.postId, postIds));

  const map = new Map<number, string[]>();
  rows.forEach((row) => {
    const list = map.get(row.postId) ?? [];
    list.push(row.tagName);
    map.set(row.postId, list);
  });
  return map;
};

const getPostLikesMap = async (postIds: number[]) => {
  if (postIds.length === 0) {
    return new Map<number, number>();
  }

  const rows = await db
    .select({ postId: forumPostLikes.postId, count: sql<number>`count(*)` })
    .from(forumPostLikes)
    .where(inArray(forumPostLikes.postId, postIds))
    .groupBy(forumPostLikes.postId);

  const map = new Map<number, number>();
  rows.forEach((row) => {
    map.set(row.postId, Number(row.count));
  });
  return map;
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

export const createForumPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { title, body, tags, courseId } = (req as any).validated.body;
    const normalizedTags = normalizeTags(tags);

    const [post] = await db
      .insert(forumPosts)
      .values({
        userId,
        courseId: courseId ?? null,
        title,
        body,
      })
      .returning();

    if (normalizedTags.length > 0) {
      const tagRows = await upsertTags(normalizedTags);
      if (tagRows.length > 0) {
        await db.insert(forumPostTags).values(
          tagRows.map((tag) => ({
            postId: post.id,
            tagId: tag.id,
          })),
        );
      }
    }

    const postWithRelations = await db.query.forumPosts.findFirst({
      where: eq(forumPosts.id, post.id),
      with: {
        user: true,
        attachments: true,
        replies: {
          with: {
            user: true,
            attachments: true,
          },
        },
      },
    });

    if (!postWithRelations) {
      return res.status(201).json(post);
    }

    const postTagsMap = await getPostTagsMap([postWithRelations.id]);
    const postLikesMap = await getPostLikesMap([postWithRelations.id]);
    const replyIds = postWithRelations.replies?.map((reply) => reply.id) ?? [];
    const replyTagsMap = await getReplyTagsMap(replyIds);
    const replyLikesMap = await getReplyLikesMap(replyIds);

    res.status(201).json({
      ...postWithRelations,
      user: sanitizeUserPublic(postWithRelations.user),
      tags: postTagsMap.get(postWithRelations.id) ?? [],
      likesCount: postLikesMap.get(postWithRelations.id) ?? 0,
      replies: postWithRelations.replies?.map((reply) => ({
        ...reply,
        user: sanitizeUserPublic(reply.user),
        tags: replyTagsMap.get(reply.id) ?? [],
        likesCount: replyLikesMap.get(reply.id) ?? 0,
      })),
    });
  } catch (error) {
    console.error("[forumPostController] createForumPost error:", error);
    res.status(500).json({ error: "Failed to create forum post" });
  }
};

export const getAllForumPosts = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limitRaw = Number(req.query.limit) || 20;
    const limit = Math.min(Math.max(1, limitRaw), 100);
    const offset = (page - 1) * limit;
    const courseId = req.query.courseId ? Number(req.query.courseId) : undefined;

    const whereClause = courseId ? eq(forumPosts.courseId, courseId) : undefined;

    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(forumPosts)
      .where(whereClause);
    const dataQuery = db.query.forumPosts.findMany({
      where: whereClause,
      with: {
        user: true,
        attachments: true,
        replies: {
          with: {
            user: true,
            attachments: true,
          },
        },
      },
      orderBy: desc(forumPosts.createdAt),
      limit,
      offset,
    });

    const [[countResult], posts] = await Promise.all([countQuery, dataQuery]);
    const total = Number(countResult?.count ?? 0);
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    const postIds = posts.map((post) => post.id);
    const replyIds = posts.flatMap((post) => post.replies?.map((r) => r.id) ?? []);
    const postTagsMap = await getPostTagsMap(postIds);
    const postLikesMap = await getPostLikesMap(postIds);
    const replyTagsMap = await getReplyTagsMap(replyIds);
    const replyLikesMap = await getReplyLikesMap(replyIds);

    res.json({
      data: posts.map((post) => ({
        ...post,
        user: sanitizeUserPublic(post.user),
        tags: postTagsMap.get(post.id) ?? [],
        likesCount: postLikesMap.get(post.id) ?? 0,
        replies: post.replies?.map((reply) => ({
          ...reply,
          user: sanitizeUserPublic(reply.user),
          tags: replyTagsMap.get(reply.id) ?? [],
          likesCount: replyLikesMap.get(reply.id) ?? 0,
        })),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("[forumPostController] getAllForumPosts error:", error);
    res.status(500).json({ error: "Failed to fetch forum posts" });
  }
};

export const getForumPostById = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const post = await db.query.forumPosts.findFirst({
      where: eq(forumPosts.id, Number(postId)),
      with: {
        user: true,
        attachments: true,
        replies: {
          with: {
            user: true,
            attachments: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Forum post not found" });
    }

    const postTagsMap = await getPostTagsMap([post.id]);
    const postLikesMap = await getPostLikesMap([post.id]);
    const replyIds = post.replies?.map((reply) => reply.id) ?? [];
    const replyTagsMap = await getReplyTagsMap(replyIds);
    const replyLikesMap = await getReplyLikesMap(replyIds);

    res.json({
      ...post,
      user: sanitizeUserPublic(post.user),
      tags: postTagsMap.get(post.id) ?? [],
      likesCount: postLikesMap.get(post.id) ?? 0,
      replies: post.replies?.map((reply) => ({
        ...reply,
        user: sanitizeUserPublic(reply.user),
        tags: replyTagsMap.get(reply.id) ?? [],
        likesCount: replyLikesMap.get(reply.id) ?? 0,
      })),
    });
  } catch (error) {
    console.error("[forumPostController] getForumPostById error:", error);
    res.status(500).json({ error: "Failed to fetch forum post" });
  }
};

export const updateForumPost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { title, body, tags, courseId } = (req as any).validated.body;
    const currentUser = (req as any).user;
    const normalizedTags = normalizeTags(tags);

    const existing = await db.query.forumPosts.findFirst({
      where: eq(forumPosts.id, Number(postId)),
    });

    if (!existing) {
      return res.status(404).json({ error: "Forum post not found" });
    }

    if (currentUser.role !== "ADMIN" && existing.userId !== currentUser.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const [updated] = await db
      .update(forumPosts)
      .set({
        title,
        body,
        courseId: courseId ?? null,
        updatedAt: new Date(),
      })
      .where(eq(forumPosts.id, Number(postId)))
      .returning();

    if (tags) {
      await db
        .delete(forumPostTags)
        .where(eq(forumPostTags.postId, Number(postId)));

      if (normalizedTags.length > 0) {
        const tagRows = await upsertTags(normalizedTags);
        if (tagRows.length > 0) {
          await db.insert(forumPostTags).values(
            tagRows.map((tag) => ({
              postId: Number(postId),
              tagId: tag.id,
            })),
          );
        }
      }
    }

    const updatedWithRelations = await db.query.forumPosts.findFirst({
      where: eq(forumPosts.id, updated.id),
      with: {
        user: true,
        attachments: true,
        replies: {
          with: {
            user: true,
            attachments: true,
          },
        },
      },
    });

    if (!updatedWithRelations) {
      return res.json(updated);
    }

    const postTagsMap = await getPostTagsMap([updatedWithRelations.id]);
    const postLikesMap = await getPostLikesMap([updatedWithRelations.id]);
    const replyIds = updatedWithRelations.replies?.map((reply) => reply.id) ?? [];
    const replyTagsMap = await getReplyTagsMap(replyIds);
    const replyLikesMap = await getReplyLikesMap(replyIds);

    res.json({
      ...updatedWithRelations,
      user: sanitizeUserPublic(updatedWithRelations.user),
      tags: postTagsMap.get(updatedWithRelations.id) ?? [],
      likesCount: postLikesMap.get(updatedWithRelations.id) ?? 0,
      replies: updatedWithRelations.replies?.map((reply) => ({
        ...reply,
        user: sanitizeUserPublic(reply.user),
        tags: replyTagsMap.get(reply.id) ?? [],
        likesCount: replyLikesMap.get(reply.id) ?? 0,
      })),
    });
  } catch (error) {
    console.error("[forumPostController] updateForumPost error:", error);
    res.status(500).json({ error: "Failed to update forum post" });
  }
};

export const likeForumPost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = (req as any).user.id;

    const post = await db.query.forumPosts.findFirst({
      where: eq(forumPosts.id, Number(postId)),
    });

    if (!post) {
      return res.status(404).json({ error: "Forum post not found" });
    }

    const existing = await db.query.forumPostLikes.findFirst({
      where: and(
        eq(forumPostLikes.postId, Number(postId)),
        eq(forumPostLikes.userId, userId),
      ),
    });

    if (!existing) {
      await db.insert(forumPostLikes).values({
        postId: Number(postId),
        userId,
      });
    }

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(forumPostLikes)
      .where(eq(forumPostLikes.postId, Number(postId)));

    res.json({
      postId: Number(postId),
      likesCount: Number(countRow?.count ?? 0),
    });
  } catch (error) {
    console.error("[forumPostController] likeForumPost error:", error);
    res.status(500).json({ error: "Failed to like forum post" });
  }
};

export const unlikeForumPost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = (req as any).user.id;

    const post = await db.query.forumPosts.findFirst({
      where: eq(forumPosts.id, Number(postId)),
    });

    if (!post) {
      return res.status(404).json({ error: "Forum post not found" });
    }

    await db
      .delete(forumPostLikes)
      .where(
        and(
          eq(forumPostLikes.postId, Number(postId)),
          eq(forumPostLikes.userId, userId),
        ),
      );

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(forumPostLikes)
      .where(eq(forumPostLikes.postId, Number(postId)));

    res.json({
      postId: Number(postId),
      likesCount: Number(countRow?.count ?? 0),
    });
  } catch (error) {
    console.error("[forumPostController] unlikeForumPost error:", error);
    res.status(500).json({ error: "Failed to unlike forum post" });
  }
};

export const deleteForumPost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const currentUser = (req as any).user;

    const existing = await db.query.forumPosts.findFirst({
      where: eq(forumPosts.id, Number(postId)),
    });

    if (!existing) {
      return res.status(404).json({ error: "Forum post not found" });
    }

    if (currentUser.role !== "ADMIN" && existing.userId !== currentUser.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await db.delete(forumPosts).where(eq(forumPosts.id, Number(postId)));

    res.status(204).send();
  } catch (error) {
    console.error("[forumPostController] deleteForumPost error:", error);
    res.status(500).json({ error: "Failed to delete forum post" });
  }
};
