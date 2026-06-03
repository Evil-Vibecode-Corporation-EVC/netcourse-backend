import { Router } from "express";
import { getMySubscription } from "../../controllers/subscriptionController";
import { authenticate } from "../../middleware/authMiddleware";

const router = Router();

router.get("/me", authenticate, getMySubscription);

export default router;
