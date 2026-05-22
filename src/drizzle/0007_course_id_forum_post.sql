ALTER TABLE "forum_posts" ADD COLUMN "course_id" integer;
ALTER TABLE "forum_posts" ADD CONSTRAINT "ForumPosts_course_id_fkey"
  FOREIGN KEY ("course_id") REFERENCES "courses"("id")
  ON UPDATE cascade ON DELETE set null;
