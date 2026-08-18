ALTER TABLE "decks" ADD COLUMN "position" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
WITH ordered_decks AS (
	SELECT
		"id",
		row_number() OVER (PARTITION BY "owner_id" ORDER BY "created_at", "name") - 1 AS next_position
	FROM "decks"
)
UPDATE "decks"
SET "position" = ordered_decks.next_position
FROM ordered_decks
WHERE "decks"."id" = ordered_decks."id";--> statement-breakpoint
CREATE INDEX "decks_owner_id_position_idx" ON "decks" USING btree ("owner_id","position");
