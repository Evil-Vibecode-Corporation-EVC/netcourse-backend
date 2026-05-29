import { Router } from "express";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
} from "../../controllers/authController";
import { validate } from "../../middleware/validate";
import {
  loginRateLimiter,
  registerRateLimiter,
  forgotPasswordRateLimiter,
} from "../../middleware/rateLimit";
import { createUserSchema } from "../../validators/userSchemas";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from "../../validators/authSchemas";

const router = Router();

router.post("/register", registerRateLimiter, validate(createUserSchema), register);
router.post("/login", loginRateLimiter, validate(loginSchema), login);
router.post(
  "/forgot-password",
  forgotPasswordRateLimiter,
  validate(forgotPasswordSchema),
  forgotPassword,
);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

export default router;
