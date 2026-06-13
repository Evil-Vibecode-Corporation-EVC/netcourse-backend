import { Router } from "express";
import {
  updateUser,
  deleteUser,
  getUserById,
  getMe,
} from "../../controllers/userController"
import { updateUserSchema } from "../../validators/userSchemas";
import { authenticate, requireRole } from "../../middleware/authMiddleware";
import { validate } from "../../middleware/validate";

const router = Router();

router.use(authenticate);

router.get("/me", getMe);
router.delete("/:id",  deleteUser);
router.put("/:id", validate(updateUserSchema), updateUser);
router.get("/:id", getUserById);

export default router;
