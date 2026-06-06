import { Request, Response } from "express";
import { db } from "../drizzle/db";
import { forumPosts, forumReplies, forumPostAttachments, forumReplyAttachments } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { uploadFile, deleteFile } from "../utils/r2";

export const uploadPostAttachment = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const postId = Number(req.params.postId);
    const userId = (req as any).user.id;

    const post = await db.query.forumPosts.findFirst({
      where: eq(forumPosts.id, postId),
    });

    if (!post) {
      return res.status(404).json({ error: "Forum post not found" });
    }

    if (post.userId !== userId) {
      return res.status(403).json({ error: "You can only attach files to your own posts" });
    }

    const uuid = crypto.randomUUID();
    const key = `forum-attachments/${postId}/${uuid}`;

    const url = await uploadFile(key, file.buffer, file.mimetype);

    const [attachment] = await db
      .insert(forumPostAttachments)
      .values({
        postId,
        r2Key: url,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
      })
      .returning();

    res.status(201).json(attachment);
  } catch (error) {
    console.error("Failed to upload forum attachment:", error);
    res.status(500).json({ error: "Failed to upload attachment" });
  }
};

export const deletePostAttachment = async (req: Request, res: Response) => {
  try {
    const postId = Number(req.params.postId);
    const attachmentId = Number(req.params.attachmentId);
    const userId = (req as any).user.id;

    const post = await db.query.forumPosts.findFirst({
      where: eq(forumPosts.id, postId),
    });

    if (!post) {
      return res.status(404).json({ error: "Forum post not found" });
    }

    if (post.userId !== userId) {
      return res.status(403).json({ error: "You can only delete attachments from your own posts" });
    }

    const [attachment] = await db
      .select()
      .from(forumPostAttachments)
      .where(
        and(
          eq(forumPostAttachments.id, attachmentId),
          eq(forumPostAttachments.postId, postId),
        ),
      );

    if (!attachment) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    await deleteFile(attachment.r2Key);
    await db.delete(forumPostAttachments).where(eq(forumPostAttachments.id, attachmentId));

    res.json({ message: "Attachment deleted" });
  } catch (error) {
    console.error("Failed to delete forum attachment:", error);
    res.status(500).json({ error: "Failed to delete attachment" });
  }
};

export const uploadReplyAttachment = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const postId = Number(req.params.postId);
    const replyId = Number(req.params.replyId);
    const userId = (req as any).user.id;

    const reply = await db.query.forumReplies.findFirst({
      where: and(eq(forumReplies.id, replyId), eq(forumReplies.postId, postId)),
    });

    if (!reply) {
      return res.status(404).json({ error: "Forum reply not found" });
    }

    if (reply.userId !== userId) {
      return res.status(403).json({ error: "You can only attach files to your own replies" });
    }

    const uuid = crypto.randomUUID();
    const key = `forum-attachments/${postId}/${replyId}/${uuid}`;

    const url = await uploadFile(key, file.buffer, file.mimetype);

    const [attachment] = await db
      .insert(forumReplyAttachments)
      .values({
        replyId,
        r2Key: url,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
      })
      .returning();

    res.status(201).json(attachment);
  } catch (error) {
    console.error("Failed to upload reply attachment:", error);
    res.status(500).json({ error: "Failed to upload attachment" });
  }
};

export const deleteReplyAttachment = async (req: Request, res: Response) => {
  try {
    const replyId = Number(req.params.replyId);
    const attachmentId = Number(req.params.attachmentId);
    const userId = (req as any).user.id;

    const reply = await db.query.forumReplies.findFirst({
      where: eq(forumReplies.id, replyId),
    });

    if (!reply) {
      return res.status(404).json({ error: "Forum reply not found" });
    }

    if (reply.userId !== userId) {
      return res.status(403).json({ error: "You can only delete attachments from your own replies" });
    }

    const [attachment] = await db
      .select()
      .from(forumReplyAttachments)
      .where(
        and(
          eq(forumReplyAttachments.id, attachmentId),
          eq(forumReplyAttachments.replyId, replyId),
        ),
      );

    if (!attachment) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    await deleteFile(attachment.r2Key);
    await db.delete(forumReplyAttachments).where(eq(forumReplyAttachments.id, attachmentId));

    res.json({ message: "Attachment deleted" });
  } catch (error) {
    console.error("Failed to delete reply attachment:", error);
    res.status(500).json({ error: "Failed to delete attachment" });
  }
};
