CREATE TYPE "public"."SocialPlatform" AS ENUM('github', 'twitter', 'youtube', 'website', 'other');--> statement-breakpoint
CREATE TABLE "badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"image_url" text,
	"course_id" integer
);--> statement-breakpoint
CREATE TABLE "certifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"issued_at" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"certificate_code" text NOT NULL
);--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"badge_id" integer NOT NULL,
	"awarded_at" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);--> statement-breakpoint
CREATE TABLE "user_social_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"platform" "SocialPlatform" NOT NULL,
	"url" text NOT NULL
);--> statement-breakpoint
ALTER TABLE "badges" ADD CONSTRAINT "Badge_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "certifications" ADD CONSTRAINT "Certification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "certifications" ADD CONSTRAINT "Certification_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "UserBadge_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "UserBadge_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_social_links" ADD CONSTRAINT "UserSocialLinks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "certifications_user_id_course_id_key" ON "certifications" USING btree ("user_id" int4_ops,"course_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "certifications_certificate_code_key" ON "certifications" USING btree ("certificate_code" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "user_badges_user_id_badge_id_key" ON "user_badges" USING btree ("user_id" int4_ops,"badge_id" int4_ops);
