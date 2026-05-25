import { Router } from "express";
import { authenticate } from "../../middleware/authMiddleware";
import { validate } from "../../middleware/validate";
import { deepseekChat } from "../../controllers/deepseekController";
import { deepseekChatSchema } from "../../validators/deepseekSchemas";

const router = Router();

router.post("/chat", authenticate, validate(deepseekChatSchema), deepseekChat);

export default router;
