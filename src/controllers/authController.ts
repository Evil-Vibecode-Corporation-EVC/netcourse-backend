import { Request, Response } from "express";
import { db } from "../drizzle/db";
import { users } from "../drizzle/schema";
import { eq, and, gt } from "drizzle-orm";
import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import {
  generateResetToken,
  hashResetToken,
  sendPasswordResetEmail,
} from "../services/passwordResetService";

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error("JWT_SECRET is required");
}

const PEPPER = process.env.PASSWORD_PEPPER;

if (!PEPPER) {
  throw new Error("PASSWORD_PEPPER is required");
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, username, avatarUrl, bio } = (req as any).validated
      .body;

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await argon2.hash(password + PEPPER);

    const [user] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        username,
        avatarUrl,
        bio,
        role: "USER",
      })
      .returning();

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET,
      { expiresIn: "14d" },
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        bio: user.bio,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to register user" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = (req as any).validated.body;

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await argon2.verify(user.password, password + PEPPER);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET,
      { expiresIn: "14d" },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = (req as any).validated.body;

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return res.json({
        message: "If an account with that email exists, reset instructions were sent",
      });
    }

    const { token, tokenHash, expiresAt } = generateResetToken();

    await db
      .update(users)
      .set({
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpiresAt: expiresAt,
      })
      .where(eq(users.id, user.id));

    await sendPasswordResetEmail(user.email, token);

    return res.json({
      message: "If an account with that email exists, reset instructions were sent",
    });
  } catch (error) {
    console.error("forgotPassword error:", error);
    return res.status(500).json({ error: "Failed to process forgot password request" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = (req as any).validated.body;
    const tokenHash = hashResetToken(token);

    const user = await db.query.users.findFirst({
      where: and(
        eq(users.resetPasswordTokenHash, tokenHash),
        gt(users.resetPasswordExpiresAt, new Date()),
      ),
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const hashedPassword = await argon2.hash(password + PEPPER);

    await db
      .update(users)
      .set({
        password: hashedPassword,
        resetPasswordTokenHash: null,
        resetPasswordExpiresAt: null,
      })
      .where(eq(users.id, user.id));

    return res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(500).json({ error: "Failed to reset password" });
  }
};
