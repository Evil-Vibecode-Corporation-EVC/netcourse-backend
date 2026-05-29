import crypto from "node:crypto";
import { Resend } from "resend";

const RESET_TOKEN_TTL_MINUTES = Number(
  process.env.RESET_TOKEN_TTL_MINUTES || "30",
);

const FRONTEND_URL = process.env.FRONTEND_URL || "https://netcourse.tech";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const MAIL_FROM = process.env.MAIL_FROM;

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export const generateResetToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

  return { token, tokenHash, expiresAt };
};

export const hashResetToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const sendPasswordResetEmail = async (toEmail: string, token: string) => {
  if (!resend || !MAIL_FROM) {
    throw new Error("Resend mail configuration is missing");
  }

  const resetLink = `${FRONTEND_URL.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;

  await resend.emails.send({
    from: MAIL_FROM,
    to: toEmail,
    subject: "Reset your NetCourse password",
    html: `
      <p>Hello,</p>
      <p>We received a request to reset your password.</p>
      <p><a href="${resetLink}">Reset password</a></p>
      <p>This link will expire in ${RESET_TOKEN_TTL_MINUTES} minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  });
};
