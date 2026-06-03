import { Router } from "express";
import authRoutes from "./auth";
import courseRoutes from "./courses";
import sectionRoutes from "./sections";
import lessonRoutes from "./lessons";
import quizRoutes from "./quizzes";
import questionRoutes from "./questions";
import answerRoutes from "./answers";
import enrollmentRoutes from "./enrollments";
import progressRoutes from "./progress";
import userRoutes from "./users";
import socialLinksRoutes from "./sociallinks";
import badgesRoutes from "./badges";
import certificationsRoutes from "./certifications";
import forumPostsRoutes from "./forumPosts";
import forumRepliesRoutes from "./forumReplies";
import profileRoutes from "./profiles";
import courseRatingRoutes from "./courseRatings";
import siteVisitsRoutes from "./siteVisits";
import deepseekRoutes from "./deepseek";
import subscriptionRoutes from "./subscriptions";
import { requireActiveSubscription } from "../../middleware/subscriptionGuard";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/courses", courseRoutes);
router.use("/courses/:courseId/enrollments", enrollmentRoutes);
router.use("/courses/:courseId/sections", requireActiveSubscription, sectionRoutes);
router.use("/courses/:courseId/sections/:sectionId/lessons", requireActiveSubscription, lessonRoutes);
router.use("/courses/:courseId/progress", progressRoutes);
router.use(
  "/courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes",
  quizRoutes,
);
router.use(
  "/courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions",
  questionRoutes,
);
router.use(
  "/courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions/:questionId/answers",
  answerRoutes,
);
router.use("/social-links", socialLinksRoutes);
router.use("/badges", badgesRoutes);
router.use("/certifications", certificationsRoutes);
router.use("/forum/posts", forumPostsRoutes);
router.use("/forum/posts/:postId/replies", forumRepliesRoutes);
router.use("/profiles", profileRoutes);
router.use("/courses/:courseId/ratings", courseRatingRoutes);
router.use("/site-visits", siteVisitsRoutes);
router.use("/deepseek", deepseekRoutes);
router.use("/subscriptions", subscriptionRoutes);

export default router;
