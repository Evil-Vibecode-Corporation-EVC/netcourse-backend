import {
  pgTable,
  uniqueIndex,
  serial,
  text,
  timestamp,
  foreignKey,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const ContentType = pgEnum("ContentType", ["video", "text", "quiz"]);
export const ProgressStatus = pgEnum("ProgressStatus", [
  "not_started",
  "in_progress",
  "completed",
]);
export const QuestionType = pgEnum("QuestionType", [
  "single",
  "multiple",
  "text",
]);
export const Role = pgEnum("Role", ["ADMIN", "USER", "STUDENT"]);
export const SocialPlatform = pgEnum("SocialPlatform", [
  "github",
  "twitter",
  "youtube",
  "website",
  "other",
]);

export const siteVisits = pgTable("site_visits", {
  id: integer().primaryKey().notNull(),
  count: integer().notNull().default(0),
  updatedAt: timestamp("updated_at", { precision: 3, mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// Users table
export const users = pgTable(
  "users",
  {
    id: serial().primaryKey().notNull(),
    email: text().notNull(),
    password: text().notNull(),
    username: text(),
    avatarUrl: text("avatar_url"),
    bio: text(),
    resetPasswordTokenHash: text("reset_password_token_hash"),
    resetPasswordExpiresAt: timestamp("reset_password_expires_at", {
      precision: 3,
      mode: "date",
    }),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    role: Role().default("USER").notNull(),
  },
  (table) => [
    uniqueIndex("users_email_key").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops"),
    ),
    uniqueIndex("users_username_key").using(
      "btree",
      table.username.asc().nullsLast().op("text_ops"),
    ),
  ],
);

// Courses table
export const courses = pgTable("courses", {
  id: serial().primaryKey().notNull(),
  title: text().notNull(),
  description: text(),
  category: text(),
  price: integer(),
  requireQuizCompletion: boolean("require_quiz_completion")
    .default(false)
    .notNull(),
  minQuizScore: integer("min_quiz_score").default(65).notNull(),
});

export const courseRatings = pgTable(
  "course_ratings",
  {
    id: serial().primaryKey().notNull(),
    userId: integer("user_id").notNull(),
    courseId: integer("course_id").notNull(),
    rating: integer().notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("course_ratings_user_id_course_id_key").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops"),
      table.courseId.asc().nullsLast().op("int4_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "CourseRatings_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.courseId],
      foreignColumns: [courses.id],
      name: "CourseRatings_course_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

// Sections table
export const sections = pgTable(
  "sections",
  {
    id: serial().primaryKey().notNull(),
    courseId: integer("course_id").notNull(),
    title: text().notNull(),
    orderIndex: integer("order_index").default(0).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.courseId],
      foreignColumns: [courses.id],
      name: "Section_course_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

// Lessons table
export const lessons = pgTable(
  "lessons",
  {
    id: serial().primaryKey().notNull(),
    sectionId: integer("section_id").notNull(),
    title: text().notNull(),
    contentType: ContentType("content_type"),
    videoUrl: text("video_url"),
    textContent: text("text_content"),
    orderIndex: integer("order_index").default(0).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.sectionId],
      foreignColumns: [sections.id],
      name: "Lesson_section_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

// Quizzes table
export const quizzes = pgTable(
  "quizzes",
  {
    id: serial().primaryKey().notNull(),
    lessonId: integer("lesson_id").notNull(),
    title: text().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.lessonId],
      foreignColumns: [lessons.id],
      name: "Quiz_lesson_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const quizAttempts = pgTable(
  "quiz_attempts",
  {
    id: serial().primaryKey().notNull(),
    userId: integer("user_id").notNull(),
    quizId: integer("quiz_id").notNull(),
    score: integer().notNull(),
    passed: boolean().default(false).notNull(),
    completedAt: timestamp("completed_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "QuizAttempts_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.quizId],
      foreignColumns: [quizzes.id],
      name: "QuizAttempts_quiz_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

// Questions table
export const questions = pgTable(
  "questions",
  {
    id: serial().primaryKey().notNull(),
    quizId: integer("quiz_id").notNull(),
    questionText: text("question_text").notNull(),
    questionType: QuestionType("question_type"),
  },
  (table) => [
    foreignKey({
      columns: [table.quizId],
      foreignColumns: [quizzes.id],
      name: "Question_quiz_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

// Answers table
export const answers = pgTable(
  "answers",
  {
    id: serial().primaryKey().notNull(),
    questionId: integer("question_id"),
    answerText: text("answer_text").notNull(),
    isCorrect: boolean("is_correct").default(false).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.questionId],
      foreignColumns: [questions.id],
      name: "Answer_question_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

// Enrollments table
export const enrollments = pgTable(
  "enrollments",
  {
    id: serial().primaryKey().notNull(),
    userId: integer("user_id").notNull(),
    courseId: integer("course_id").notNull(),
    enrolledAt: timestamp("enrolled_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("Enrollment_user_id_course_id_key").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops"),
      table.courseId.asc().nullsLast().op("int4_ops"),
    ),
    foreignKey({
      columns: [table.courseId],
      foreignColumns: [courses.id],
      name: "Enrollment_course_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "Enrollment_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

// Progress table
export const progress = pgTable(
  "progress",
  {
    id: serial().primaryKey().notNull(),
    userId: integer("user_id").notNull(),
    courseId: integer("course_id").notNull(),
    status: ProgressStatus().default("not_started").notNull(),
    updatedAt: timestamp("updated_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("progress_user_id_course_id_key").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops"),
      table.courseId.asc().nullsLast().op("int4_ops"),
    ),
    foreignKey({
      columns: [table.courseId],
      foreignColumns: [courses.id],
      name: "progress_course_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "Progress_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

// Social Links table
export const userSocialLinks = pgTable(
  "user_social_links",
  {
    id: serial().primaryKey().notNull(),
    userId: integer("user_id").notNull(),
    platform: SocialPlatform("platform").notNull(),
    url: text().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "UserSocialLinks_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

// Badges table
export const badges = pgTable(
  "badges",
  {
    id: serial().primaryKey().notNull(),
    name: text().notNull(),
    description: text(),
    imageUrl: text("image_url"),
    courseId: integer("course_id"),
  },
  (table) => [
    foreignKey({
      columns: [table.courseId],
      foreignColumns: [courses.id],
      name: "Badge_course_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
  ],
);

export const userBadges = pgTable(
  "user_badges",
  {
    id: serial().primaryKey().notNull(),
    userId: integer("user_id").notNull(),
    badgeId: integer("badge_id").notNull(),
    awardedAt: timestamp("awarded_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("user_badges_user_id_badge_id_key").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops"),
      table.badgeId.asc().nullsLast().op("int4_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "UserBadge_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.badgeId],
      foreignColumns: [badges.id],
      name: "UserBadge_badge_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const certifications = pgTable(
  "certifications",
  {
    id: serial().primaryKey().notNull(),
    userId: integer("user_id").notNull(),
    courseId: integer("course_id").notNull(),
    issuedAt: timestamp("issued_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    certificateCode: text("certificate_code").notNull(),
  },
  (table) => [
    uniqueIndex("certifications_user_id_course_id_key").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops"),
      table.courseId.asc().nullsLast().op("int4_ops"),
    ),
    uniqueIndex("certifications_certificate_code_key").using(
      "btree",
      table.certificateCode.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "Certification_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.courseId],
      foreignColumns: [courses.id],
      name: "Certification_course_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

// Forum posts table
export const forumPosts = pgTable(
  "forum_posts",
  {
    id: serial().primaryKey().notNull(),
    userId: integer("user_id").notNull(),
    courseId: integer("course_id"),
    title: text().notNull(),
    body: text().notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "ForumPosts_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.courseId],
      foreignColumns: [courses.id],
      name: "ForumPosts_course_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
  ],
);

// Forum replies table
export const forumReplies = pgTable(
  "forum_replies",
  {
    id: serial().primaryKey().notNull(),
    postId: integer("post_id").notNull(),
    userId: integer("user_id").notNull(),
    body: text().notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.postId],
      foreignColumns: [forumPosts.id],
      name: "ForumReplies_post_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "ForumReplies_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

// Forum tags table
export const forumTags = pgTable(
  "forum_tags",
  {
    id: serial().primaryKey().notNull(),
    name: text().notNull(),
  },
  (table) => [
    uniqueIndex("forum_tags_name_key").using(
      "btree",
      table.name.asc().nullsLast().op("text_ops"),
    ),
  ],
);

// Forum post tags join table
export const forumPostTags = pgTable(
  "forum_post_tags",
  {
    id: serial().primaryKey().notNull(),
    postId: integer("post_id").notNull(),
    tagId: integer("tag_id").notNull(),
  },
  (table) => [
    uniqueIndex("forum_post_tags_post_id_tag_id_key").using(
      "btree",
      table.postId.asc().nullsLast().op("int4_ops"),
      table.tagId.asc().nullsLast().op("int4_ops"),
    ),
    foreignKey({
      columns: [table.postId],
      foreignColumns: [forumPosts.id],
      name: "ForumPostTags_post_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.tagId],
      foreignColumns: [forumTags.id],
      name: "ForumPostTags_tag_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

// Forum reply tags join table
export const forumReplyTags = pgTable(
  "forum_reply_tags",
  {
    id: serial().primaryKey().notNull(),
    replyId: integer("reply_id").notNull(),
    tagId: integer("tag_id").notNull(),
  },
  (table) => [
    uniqueIndex("forum_reply_tags_reply_id_tag_id_key").using(
      "btree",
      table.replyId.asc().nullsLast().op("int4_ops"),
      table.tagId.asc().nullsLast().op("int4_ops"),
    ),
    foreignKey({
      columns: [table.replyId],
      foreignColumns: [forumReplies.id],
      name: "ForumReplyTags_reply_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.tagId],
      foreignColumns: [forumTags.id],
      name: "ForumReplyTags_tag_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

// Forum post likes table
export const forumPostLikes = pgTable(
  "forum_post_likes",
  {
    id: serial().primaryKey().notNull(),
    postId: integer("post_id").notNull(),
    userId: integer("user_id").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("forum_post_likes_post_id_user_id_key").using(
      "btree",
      table.postId.asc().nullsLast().op("int4_ops"),
      table.userId.asc().nullsLast().op("int4_ops"),
    ),
    foreignKey({
      columns: [table.postId],
      foreignColumns: [forumPosts.id],
      name: "ForumPostLikes_post_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "ForumPostLikes_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

// Forum reply likes table
export const forumReplyLikes = pgTable(
  "forum_reply_likes",
  {
    id: serial().primaryKey().notNull(),
    replyId: integer("reply_id").notNull(),
    userId: integer("user_id").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("forum_reply_likes_reply_id_user_id_key").using(
      "btree",
      table.replyId.asc().nullsLast().op("int4_ops"),
      table.userId.asc().nullsLast().op("int4_ops"),
    ),
    foreignKey({
      columns: [table.replyId],
      foreignColumns: [forumReplies.id],
      name: "ForumReplyLikes_reply_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "ForumReplyLikes_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: serial().primaryKey().notNull(),
    userId: integer("user_id").notNull(),
    plan: text().notNull(),
    status: text().default("active").notNull(),
    startedAt: timestamp("started_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    expiresAt: timestamp("expires_at", { precision: 3, mode: "date" })
      .notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { precision: 3, mode: "date" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "Subscriptions_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);
