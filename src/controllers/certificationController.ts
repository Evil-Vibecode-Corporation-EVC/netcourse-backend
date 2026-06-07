import { Request, Response } from "express";
const PDFDocument = require("pdfkit");
import { db } from "../drizzle/db";
import { certifications, users, courses } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import path from "path";
import fs from "fs";

export const getMyCertifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const certs = await db.query.certifications.findMany({
      where: eq(certifications.userId, userId),
      with: { course: true },
    });

    res.json(certs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch certifications" });
  }
};

export const getUserCertifications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const certs = await db.query.certifications.findMany({
      where: eq(certifications.userId, Number(userId)),
      with: { course: true },
    });

    res.json(certs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch certifications" });
  }
};

export const verifyCertificate = async (req: Request, res: Response) => {
  try {
    const code = String(req.params.code);

    const cert = await db.query.certifications.findFirst({
      where: eq(certifications.certificateCode, code),
      with: { user: true, course: true },
    });

    if (!cert) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    res.json({
      valid: true,
      certificateCode: cert.certificateCode,
      issuedAt: cert.issuedAt,
      user: {
        username: cert.user.username,
        avatarUrl: cert.user.avatarUrl,
      },
      course: {
        title: cert.course.title,
        category: cert.course.category,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to verify certificate" });
  }
};

export const getCertificatePdf = async (req: Request, res: Response) => {
  try {
    const code = String(req.params.code);
    const currentUser = (req as any).user;

    if (!currentUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const cert = await db.query.certifications.findFirst({
      where: eq(certifications.certificateCode, code),
    });

    if (!cert) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    if (currentUser.role !== "ADMIN" && currentUser.id !== cert.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, cert.userId),
    });

    const course = await db.query.courses.findFirst({
      where: (courses, { eq }) => eq(courses.id, cert.courseId),
    });

    if (!user || !course) {
      return res.status(404).json({ error: "User or course not found" });
    }

    const issuedOn = cert.issuedAt
      ? new Date(cert.issuedAt).toLocaleDateString("ru-RU", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Н/Д";
    const username = user.username || "Студент";

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="certificate-${cert.certificateCode}.pdf"`,
    );

    const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });

    doc.on("error", (err: Error) => {
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to generate certificate PDF" });
      }
    });

    doc.pipe(res);

    // ============ РЕГИСТРАЦИЯ ШРИФТОВ С ПОДДЕРЖКОЙ КИРИЛЛИЦЫ ============
    const fontsDir = path.join(__dirname, "../../fonts");

    // Проверка существования шрифтов
    const robotoRegularPath = path.join(fontsDir, "Roboto-Regular.ttf");
    const robotoBoldPath = path.join(fontsDir, "Roboto-Bold.ttf");

    if (fs.existsSync(robotoRegularPath) && fs.existsSync(robotoBoldPath)) {
      doc.registerFont("Roboto", robotoRegularPath);
      doc.registerFont("Roboto-Bold", robotoBoldPath);
    } else {
      // Fallback: используем системные шрифты (если есть)
      console.warn(
        "⚠️ Roboto fonts not found. Certificate may not display Cyrillic correctly.",
      );
    }

    const darkBg = "#0f172a";
    const lightText = "#f1f5f9";
    const emeraldAccent = "#10b981";
    const emeraldLight = "#34d399";

    doc.rect(0, 0, doc.page.width, doc.page.height).fill(darkBg);
    doc.rect(50, 50, doc.page.width - 100, 3).fill(emeraldAccent);

    doc
      .strokeColor(emeraldAccent)
      .lineWidth(2)
      .opacity(0.3)
      .rect(50, 65, doc.page.width - 100, doc.page.height - 130)
      .stroke();
    doc.opacity(1);

    const mx = 50;

    // ✅ Используем Roboto-Bold для заголовка
    doc
      .fontSize(36)
      .font("Roboto-Bold")
      .fillColor(emeraldLight)
      .text("Сертификат о прохождении", mx, 120, { align: "center" });

    doc
      .strokeColor(emeraldAccent)
      .lineWidth(1)
      .opacity(0.5)
      .moveTo(150, 180)
      .lineTo(doc.page.width - 150, 180)
      .stroke();
    doc.opacity(1);

    doc
      .fontSize(14)
      .font("Roboto")
      .fillColor(lightText)
      .text("Настоящий сертификат подтверждает, что", mx, 210, { align: "center" });

    doc
      .fontSize(28)
      .font("Roboto-Bold")
      .fillColor(emeraldAccent)
      .text(username, mx, 260, { align: "center" });

    doc
      .fontSize(14)
      .font("Roboto")
      .fillColor(lightText)
      .text("прошёл обучение по курсу", mx, 320, {
        align: "center",
      });

    // ✅ Roboto-Bold для названия курса
    doc
      .fontSize(16)
      .font("Roboto-Bold")
      .fillColor(emeraldLight)
      .text(`«${course.title}»`, mx, 350, { align: "center" });

    doc
      .strokeColor(emeraldAccent)
      .lineWidth(1)
      .opacity(0.5)
      .moveTo(150, 420)
      .lineTo(doc.page.width - 150, 420)
      .stroke();
    doc.opacity(1);

    // ✅ Roboto для даты
    doc
      .fontSize(11)
      .font("Roboto")
      .fillColor(lightText)
      .text(`Дата выдачи: ${issuedOn}`, mx, 450, { align: "center" });

    // ✅ Roboto для кода
    doc
      .fontSize(9)
      .font("Roboto")
      .fillColor(emeraldAccent)
      .opacity(0.7)
      .text(`Код сертификата: ${cert.certificateCode}`, mx, 700, {
        align: "center",
      });

    doc.opacity(1);
    doc.end();
  } catch (error) {
    console.error("Certificate generation error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate certificate PDF" });
    }
  }
};
