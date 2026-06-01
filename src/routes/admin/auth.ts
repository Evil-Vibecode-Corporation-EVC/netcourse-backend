import { Router } from "express";
import { register, login } from "../../controllers/authController";
import { validate} from "../../middleware/validate";
import { loginRateLimiter, registerRateLimiter } from "../../middleware/rateLimit";
import { createUserSchema } from "../../validators/userSchemas";
import { loginSchema } from "../../validators/authSchemas";

const router = Router();

router.post("/register", registerRateLimiter, validate(createUserSchema), register);
router.post("/login", loginRateLimiter, validate(loginSchema), login);

export default router;
