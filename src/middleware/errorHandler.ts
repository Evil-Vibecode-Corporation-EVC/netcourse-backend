import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const status = Number(err?.status) || 500;

  if (err?.code === "validation_error") {
    return res.status(status).json({
      error: "validation_error",
      issues: err.issues || [],
    });
  }

  if (err?.code === "23505") {
    return res.status(409).json({
      error: "Conflict",
    });
  }

  if (status >= 500) {
    console.error("Unhandled error:", err);
  }

  return res.status(status).json({
    error: status >= 500 ? "Internal Server Error" : err?.message || "Unknown error",
  });
};
