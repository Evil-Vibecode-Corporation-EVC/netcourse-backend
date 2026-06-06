import { Router } from "express";
import {
  uploadPostAttachment,
  deletePostAttachment,
  uploadReplyAttachment,
  deleteReplyAttachment,
} from "../../controllers/forumAttachmentController";
import { uploadForumAttachment } from "../../middleware/upload";
import { authenticate } from "../../middleware/authMiddleware";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post("/attachments", uploadForumAttachment, uploadPostAttachment);
router.delete("/attachments/:attachmentId", deletePostAttachment);

export default router;
