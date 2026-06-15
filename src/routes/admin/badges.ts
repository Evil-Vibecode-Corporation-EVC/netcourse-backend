import { Router } from "express";
import {
  createBadge,
  getAllBadges,
  updateBadge,
  deleteBadge,
  getUserBadges,
  uploadBadgeImage,
  deleteBadgeImage,
} from "../../controllers/badgeController";
import {
  createBadgeSchema,
  updateBadgeSchema,
} from "../../validators/badgeSchemas";
import { authenticate, requireRole } from "../../middleware/authMiddleware";
import { uploadBadgeImage as uploadMiddleware } from "../../middleware/upload";
import { validate } from "../../middleware/validate";

const router = Router();

router.use(authenticate, requireRole(["ADMIN"]));

router.get("/", getAllBadges);
router.post("/", validate(createBadgeSchema), createBadge);
router.put("/:id", validate(updateBadgeSchema), updateBadge);
router.delete("/:id", deleteBadge);
router.get("/users/:userId", getUserBadges);
router.put("/:id/image", uploadMiddleware, uploadBadgeImage);
router.delete("/:id/image", deleteBadgeImage);

export default router;