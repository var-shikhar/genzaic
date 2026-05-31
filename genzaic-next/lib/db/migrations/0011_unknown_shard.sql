ALTER TABLE "storefronts" ADD COLUMN "live_draft_id" uuid;--> statement-breakpoint
ALTER TABLE "storefront_drafts" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "storefront_drafts" ADD COLUMN "is_default" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "storefront_drafts_default_per_user_uq" ON "storefront_drafts" USING btree ("user_id") WHERE "storefront_drafts"."is_default" = true;