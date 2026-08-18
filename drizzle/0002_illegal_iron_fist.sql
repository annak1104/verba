CREATE TYPE "public"."english_level" AS ENUM('beginner', 'elementary', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."pronunciation_preference" AS ENUM('ukrainian', 'ipa', 'both');--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "english_level" "english_level" DEFAULT 'beginner' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "pronunciation_preference" "pronunciation_preference" DEFAULT 'ukrainian' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "onboarding_completed_at" timestamp with time zone;