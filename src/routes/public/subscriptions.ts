import { Router } from "express";
import {
  getMySubscription,
  selfSubscribe,
  cancelMySubscription,
} from "../../controllers/subscriptionController";
import { authenticate } from "../../middleware/authMiddleware";
import { validate } from "../../middleware/validate";
import { selfSubscribeSchema } from "../../validators/subscriptionSchemas";

const router = Router();

router.get("/me", authenticate, getMySubscription);
router.post("/", authenticate, validate(selfSubscribeSchema), selfSubscribe);
router.delete("/me", authenticate, cancelMySubscription);

export default router;
