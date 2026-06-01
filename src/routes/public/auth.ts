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
import { verifyTurnstile } from "../../middleware/turnstileMiddleware";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../../validators/authSchemas";

const router = Router();

router.post(
  "/register",
  registerRateLimiter,
  verifyTurnstile,
  validate(registerSchema),
  register,
);
router.post("/login", loginRateLimiter, verifyTurnstile, validate(loginSchema), login);
router.post(
  "/forgot-password",
  forgotPasswordRateLimiter,
  verifyTurnstile,
  validate(forgotPasswordSchema),
  forgotPassword,
);
router.post(
  "/reset-password",
  verifyTurnstile,
  validate(resetPasswordSchema),
  resetPassword,
);

export default router;
