import { Router } from "express";
import {
  uploadReplyAttachment,
  deleteReplyAttachment,
} from "../../controllers/forumAttachmentController";
import { uploadForumAttachment } from "../../middleware/upload";
import { authenticate } from "../../middleware/authMiddleware";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post("/attachments", uploadForumAttachment, uploadReplyAttachment);
router.delete("/attachments/:attachmentId", deleteReplyAttachment);

export default router;
