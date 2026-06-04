import { Router } from "express";
import { uploadAvatar, deleteAvatar } from "../../controllers/uploadController";
import { uploadAvatar as uploadMiddleware } from "../../middleware/upload";
import { authenticate } from "../../middleware/authMiddleware";

const router = Router();

router.use(authenticate);

router.put("/avatar", uploadMiddleware, uploadAvatar);
router.delete("/avatar", deleteAvatar);

export default router;
