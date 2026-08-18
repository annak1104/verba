CREATE TYPE "public"."learning_direction" AS ENUM('english_to_ukrainian', 'ukrainian_to_english', 'mixed');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('new', 'learning', 'reviewing', 'mastered');--> statement-breakpoint
CREATE TYPE "public"."theme_preference" AS ENUM('light', 'dark', 'system');--> statement-breakpoint
CREATE TABLE "card_tags" (
	"owner_id" varchar(128) NOT NULL,
	"card_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "card_tags_pk" PRIMARY KEY("card_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" varchar(128) NOT NULL,
	"deck_id" uuid NOT NULL,
	"english" varchar(180) NOT NULL,
	"ukrainian_translation" text NOT NULL,
	"ukrainian_pronunciation" varchar(180) NOT NULL,
	"ipa" varchar(180),
	"example_english" text,
	"example_ukrainian" text,
	"notes" text,
	"favorite" boolean DEFAULT false NOT NULL,
	"difficulty" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" varchar(128) NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"new_cards" integer DEFAULT 0 NOT NULL,
	"reviewed_cards" integer DEFAULT 0 NOT NULL,
	"correct_count" integer DEFAULT 0 NOT NULL,
	"incorrect_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" varchar(128) NOT NULL,
	"card_id" uuid NOT NULL,
	"rating" "review_rating" NOT NULL,
	"previous_status" "review_status" NOT NULL,
	"next_status" "review_status" NOT NULL,
	"previous_interval" integer NOT NULL,
	"next_interval" integer NOT NULL,
	"previous_ease" integer NOT NULL,
	"next_ease" integer NOT NULL,
	"reviewed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_state" (
	"card_id" uuid PRIMARY KEY NOT NULL,
	"owner_id" varchar(128) NOT NULL,
	"status" "review_status" DEFAULT 'new' NOT NULL,
	"next_review_at" timestamp with time zone DEFAULT now() NOT NULL,
	"interval" integer DEFAULT 0 NOT NULL,
	"ease" integer DEFAULT 250 NOT NULL,
	"correct_count" integer DEFAULT 0 NOT NULL,
	"incorrect_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" varchar(128) NOT NULL,
	"name" varchar(80) NOT NULL,
	"color" varchar(24) DEFAULT 'cyan' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"user_id" varchar(128) PRIMARY KEY NOT NULL,
	"daily_goal" integer DEFAULT 12 NOT NULL,
	"learning_direction" "learning_direction" DEFAULT 'english_to_ukrainian' NOT NULL,
	"sound_enabled" boolean DEFAULT true NOT NULL,
	"theme" "theme_preference" DEFAULT 'system' NOT NULL,
	"ai_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reviews" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "study_sessions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "words" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "reviews" CASCADE;--> statement-breakpoint
DROP TABLE "study_sessions" CASCADE;--> statement-breakpoint
DROP TABLE "words" CASCADE;--> statement-breakpoint
ALTER TABLE "decks" RENAME COLUMN "user_id" TO "owner_id";--> statement-breakpoint
ALTER TABLE "decks" DROP CONSTRAINT "decks_user_id_users_clerk_user_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email" varchar(320);--> statement-breakpoint
CREATE UNIQUE INDEX "decks_owner_id_id_unique" ON "decks" USING btree ("owner_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "cards_owner_id_id_unique" ON "cards" USING btree ("owner_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_owner_id_id_unique" ON "tags" USING btree ("owner_id","id");--> statement-breakpoint
ALTER TABLE "card_tags" ADD CONSTRAINT "card_tags_owner_id_users_clerk_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("clerk_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_tags" ADD CONSTRAINT "card_tags_owner_id_card_id_cards_owner_id_id_fk" FOREIGN KEY ("owner_id","card_id") REFERENCES "public"."cards"("owner_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_tags" ADD CONSTRAINT "card_tags_owner_id_tag_id_tags_owner_id_id_fk" FOREIGN KEY ("owner_id","tag_id") REFERENCES "public"."tags"("owner_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_owner_id_users_clerk_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("clerk_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_owner_id_deck_id_decks_owner_id_id_fk" FOREIGN KEY ("owner_id","deck_id") REFERENCES "public"."decks"("owner_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_sessions" ADD CONSTRAINT "learning_sessions_owner_id_users_clerk_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("clerk_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_history" ADD CONSTRAINT "review_history_owner_id_users_clerk_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("clerk_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_history" ADD CONSTRAINT "review_history_owner_id_card_id_cards_owner_id_id_fk" FOREIGN KEY ("owner_id","card_id") REFERENCES "public"."cards"("owner_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_state" ADD CONSTRAINT "review_state_owner_id_users_clerk_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("clerk_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_state" ADD CONSTRAINT "review_state_owner_id_card_id_cards_owner_id_id_fk" FOREIGN KEY ("owner_id","card_id") REFERENCES "public"."cards"("owner_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_owner_id_users_clerk_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("clerk_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_clerk_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("clerk_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "card_tags_owner_id_card_id_idx" ON "card_tags" USING btree ("owner_id","card_id");--> statement-breakpoint
CREATE INDEX "card_tags_owner_id_tag_id_idx" ON "card_tags" USING btree ("owner_id","tag_id");--> statement-breakpoint
CREATE INDEX "cards_owner_id_idx" ON "cards" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "cards_owner_id_deck_id_idx" ON "cards" USING btree ("owner_id","deck_id");--> statement-breakpoint
CREATE INDEX "cards_owner_id_english_idx" ON "cards" USING btree ("owner_id","english");--> statement-breakpoint
CREATE INDEX "cards_owner_id_favorite_idx" ON "cards" USING btree ("owner_id","favorite");--> statement-breakpoint
CREATE INDEX "learning_sessions_owner_id_started_at_idx" ON "learning_sessions" USING btree ("owner_id","started_at");--> statement-breakpoint
CREATE INDEX "learning_sessions_owner_id_completed_at_idx" ON "learning_sessions" USING btree ("owner_id","completed_at");--> statement-breakpoint
CREATE INDEX "review_history_owner_id_card_id_idx" ON "review_history" USING btree ("owner_id","card_id");--> statement-breakpoint
CREATE INDEX "review_history_owner_id_reviewed_at_idx" ON "review_history" USING btree ("owner_id","reviewed_at");--> statement-breakpoint
CREATE INDEX "review_state_owner_id_idx" ON "review_state" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "review_state_owner_id_status_idx" ON "review_state" USING btree ("owner_id","status");--> statement-breakpoint
CREATE INDEX "review_state_owner_id_next_review_at_idx" ON "review_state" USING btree ("owner_id","next_review_at");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_owner_id_name_unique" ON "tags" USING btree ("owner_id","name");--> statement-breakpoint
CREATE INDEX "tags_owner_id_idx" ON "tags" USING btree ("owner_id");--> statement-breakpoint
ALTER TABLE "decks" ADD CONSTRAINT "decks_owner_id_users_clerk_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("clerk_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "decks_owner_id_name_unique" ON "decks" USING btree ("owner_id","name");--> statement-breakpoint
CREATE INDEX "decks_owner_id_idx" ON "decks" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "users_clerk_user_id_idx" ON "users" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
INSERT INTO "user_settings" ("user_id", "daily_goal", "ai_enabled")
SELECT "clerk_user_id", "daily_goal", "ai_enabled"
FROM "users"
ON CONFLICT ("user_id") DO NOTHING;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "locale";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "daily_goal";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "ai_enabled";--> statement-breakpoint
DROP TYPE "public"."memory_state";
