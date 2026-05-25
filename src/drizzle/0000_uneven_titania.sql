CREATE TYPE "public"."Role" AS ENUM('ADMIN', 'USER', 'STUDENT');--> statement-breakpoint
CREATE TYPE "public"."ContentType" AS ENUM('video', 'text', 'quiz');--> statement-breakpoint
CREATE TYPE "public"."ProgressStatus" AS ENUM('not_started', 'in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "public"."QuestionType" AS ENUM('single', 'multiple', 'text');--> statement-breakpoint
CREATE TABLE "users" (
  "id" serial PRIMARY KEY NOT NULL,
  "email" text NOT NULL,
  "password" text NOT NULL,
  "username" text,
  "avatar_url" text,
  "bio" text,
  "created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "role" "Role" DEFAULT 'USER' NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_key" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_key" ON "users" USING btree ("username");--> statement-breakpoint
CREATE TABLE "courses" (
  "id" serial PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "category" text,
  "require_quiz_completion" boolean DEFAULT false NOT NULL,
  "min_quiz_score" integer DEFAULT 65 NOT NULL
);--> statement-breakpoint
CREATE TABLE "sections" (
  "id" serial PRIMARY KEY NOT NULL,
  "course_id" integer NOT NULL,
  "title" text NOT NULL,
  "order_index" integer DEFAULT 0 NOT NULL
);--> statement-breakpoint
CREATE TABLE "lessons" (
  "id" serial PRIMARY KEY NOT NULL,
  "section_id" integer NOT NULL,
  "title" text NOT NULL,
  "content_type" "ContentType",
  "video_url" text,
  "text_content" text,
  "order_index" integer DEFAULT 0 NOT NULL
);--> statement-breakpoint
CREATE TABLE "quizzes" (
  "id" serial PRIMARY KEY NOT NULL,
  "lesson_id" integer NOT NULL,
  "title" text NOT NULL
);--> statement-breakpoint
CREATE TABLE "questions" (
  "id" serial PRIMARY KEY NOT NULL,
  "quiz_id" integer NOT NULL,
  "question_text" text NOT NULL,
  "question_type" "QuestionType"
);--> statement-breakpoint
CREATE TABLE "answers" (
  "id" serial PRIMARY KEY NOT NULL,
  "question_id" integer,
  "answer_text" text NOT NULL,
  "is_correct" boolean DEFAULT false NOT NULL
);--> statement-breakpoint
CREATE TABLE "enrollments" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "course_id" integer NOT NULL,
  "enrolled_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX "Enrollment_user_id_course_id_key" ON "enrollments" USING btree ("user_id", "course_id");--> statement-breakpoint
CREATE TABLE "progress" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "course_id" integer NOT NULL,
  "status" "ProgressStatus" DEFAULT 'not_started' NOT NULL,
  "updated_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX "progress_user_id_course_id_key" ON "progress" USING btree ("user_id", "course_id");--> statement-breakpoint
