import { Router } from "express";
import {
  createSubscription,
  getUserSubscriptions,
  updateSubscription,
  cancelSubscription,
} from "../../controllers/subscriptionController";
import { authenticate, requireRole } from "../../middleware/authMiddleware";
import { validate } from "../../middleware/validate";
import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
} from "../../validators/subscriptionSchemas";

const router = Router();

router.use(authenticate, requireRole(["ADMIN"]));

router.get("/users/:userId/subscriptions", getUserSubscriptions);
router.post(
  "/users/:userId/subscriptions",
  validate(createSubscriptionSchema),
  createSubscription,
);
router.put(
  "/users/:userId/subscriptions/:id",
  validate(updateSubscriptionSchema),
  updateSubscription,
);
router.delete("/users/:userId/subscriptions/:id", cancelSubscription);

export default router;
