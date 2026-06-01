import { Router } from "express";
import {
  getSiteVisits,
  incrementSiteVisits,
} from "../../controllers/siteVisitController";
import { authenticate } from "../../middleware/authMiddleware";

const router = Router();

router.get("/", getSiteVisits);
router.post("/increment", authenticate, incrementSiteVisits);

export default router;
