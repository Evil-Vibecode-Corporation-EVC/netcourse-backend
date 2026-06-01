import { Router } from "express";
import { register, login } from "../../controllers/authController";
import { validate } from "../../middleware/validate";
import { loginRateLimiter, registerRateLimiter } from "../../middleware/rateLimit";
import { verifyTurnstile } from "../../middleware/turnstileMiddleware";
import { loginSchema, registerSchema } from "../../validators/authSchemas";

const router = Router();

router.post(
  "/register",
  registerRateLimiter,
  verifyTurnstile,
  validate(registerSchema),
  register,
);
router.post("/login", loginRateLimiter, verifyTurnstile, validate(loginSchema), login);

export default router;
