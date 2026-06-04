import { Request, Response } from "express";
import { db } from "../drizzle/db";
import { subscriptions } from "../drizzle/schema";
import { eq, and, gt, or, isNull } from "drizzle-orm";

export const createSubscription = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { plan, expiresAt } = (req as any).validated.body;
    const now = new Date();

    let expires: Date;
    if (expiresAt) {
      expires = new Date(expiresAt);
    } else {
      expires = new Date(now);
      if (plan === "monthly") {
        expires.setMonth(expires.getMonth() + 1);
      } else {
        expires.setFullYear(expires.getFullYear() + 1);
      }
    }

    const [sub] = await db
      .insert(subscriptions)
      .values({
        userId: Number(userId),
        plan,
        status: "active",
        startedAt: now,
        expiresAt: expires,
      })
      .returning();

    res.status(201).json(sub);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create subscription" });
  }
};

export const updateSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = (req as any).validated.body;

    const [sub] = await db
      .update(subscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(subscriptions.id, Number(id)))
      .returning();

    if (!sub) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    res.json(sub);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update subscription" });
  }
};

export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [sub] = await db
      .update(subscriptions)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(subscriptions.id, Number(id)))
      .returning();

    if (!sub) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    res.json(sub);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
};

export const getUserSubscriptions = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const list = await db.query.subscriptions.findMany({
      where: eq(subscriptions.userId, Number(userId)),
      orderBy: (subs, { desc }) => [desc(subs.createdAt)],
    });

    res.json(list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
};

const calcExpiry = (plan: string, from: Date): Date => {
  const d = new Date(from);
  if (plan === "monthly") d.setMonth(d.getMonth() + 1);
  else d.setFullYear(d.getFullYear() + 1);
  return d;
};

export const selfSubscribe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { plan } = (req as any).validated.body;
    const now = new Date();

    const activeSub = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active"),
        or(gt(subscriptions.expiresAt, now), isNull(subscriptions.expiresAt)),
      ),
    });

    if (activeSub) {
      const remaining = activeSub.expiresAt.getTime() - now.getTime();
      const extra = calcExpiry(plan, new Date()).getTime() - now.getTime();
      const newExpires = new Date(now.getTime() + remaining + extra);

      const [sub] = await db
        .update(subscriptions)
        .set({ plan, expiresAt: newExpires, updatedAt: now })
        .where(eq(subscriptions.id, activeSub.id))
        .returning();

      return res.json(sub);
    }

    const [sub] = await db
      .insert(subscriptions)
      .values({
        userId,
        plan,
        status: "active",
        startedAt: now,
        expiresAt: calcExpiry(plan, now),
      })
      .returning();

    res.status(201).json(sub);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create subscription" });
  }
};

export const cancelMySubscription = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const now = new Date();

    const [sub] = await db
      .update(subscriptions)
      .set({ status: "cancelled", updatedAt: now })
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, "active"),
          gt(subscriptions.expiresAt, now),
        ),
      )
      .returning();

    if (!sub) {
      return res.status(404).json({ error: "Active subscription not found" });
    }

    res.json(sub);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
};

export const getMySubscription = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const sub = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active"),
        gt(subscriptions.expiresAt, new Date()),
      ),
      orderBy: (subs, { desc }) => [desc(subs.createdAt)],
    });

    res.json(sub);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch subscription" });
  }
};
