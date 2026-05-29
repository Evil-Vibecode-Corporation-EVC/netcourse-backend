ALTER TABLE "users"
ADD COLUMN "reset_password_token_hash" text,
ADD COLUMN "reset_password_expires_at" timestamp (3);
