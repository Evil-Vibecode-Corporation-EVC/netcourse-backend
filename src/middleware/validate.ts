import { ZodType } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate = (schema: ZodType<any>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const error = new Error("Validation failed") as any;
      error.status = 400;
      error.code = "validation_error";
      error.issues = result.error.issues;
      return next(error);
    }

    (req as any).validated = result.data;

    next();
  };
};
