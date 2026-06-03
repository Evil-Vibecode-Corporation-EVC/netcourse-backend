import { Router } from "express";
import courseRoutes from "./courses";
import sectionRoutes from "./sections";
import lessonRoutes from "./lessons";
import quizRoutes from "./quizzes";
import questionRoutes from "./questions";
import answerRoutes from "./answers";
import userRoutes from "./users";
import progressRoutes from "./progress";
import authRoutes from "./auth";
import badgesRoutes from "./badges";
import certificationsRoutes from "./certifications";
import forumPostsRoutes from "./forumPosts";
import forumRepliesRoutes from "./forumReplies";
import subscriptionRoutes from "./subscriptions";


const router = Router();

router.use("/auth", authRoutes);
router.use("/courses", courseRoutes);
router.use("/courses/:courseId/sections", sectionRoutes);
router.use("/courses/:courseId/progress", progressRoutes);
router.use("/courses/:courseId/sections/:sectionId/lessons", lessonRoutes);
router.use("/users", userRoutes);
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
router.use("/badges", badgesRoutes);
router.use("/certifications", certificationsRoutes);
router.use("/forum/posts", forumPostsRoutes);
router.use("/forum/posts/:postId/replies", forumRepliesRoutes);
router.use("/subscriptions", subscriptionRoutes);

export default router;
