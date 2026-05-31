CREATE TYPE "public"."publish_state" AS ENUM('never_published', 'published', 'unpublished');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "storefront_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(80) NOT NULL,
	"content" jsonb NOT NULL,
	"preview_token" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "storefronts" ADD COLUMN "publish_state" "publish_state" DEFAULT 'never_published' NOT NULL;--> statement-breakpoint
ALTER TABLE "storefronts" ADD COLUMN "last_published_at" timestamp;--> statement-breakpoint
ALTER TABLE "storefronts" ADD COLUMN "closed_headline" varchar(120);--> statement-breakpoint
ALTER TABLE "storefronts" ADD COLUMN "closed_message" text;--> statement-breakpoint
ALTER TABLE "storefronts" ADD COLUMN "closed_show_socials" boolean DEFAULT true NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "storefront_drafts" ADD CONSTRAINT "storefront_drafts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "storefront_drafts_user_id_idx" ON "storefront_drafts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "storefront_drafts_user_updated_idx" ON "storefront_drafts" USING btree ("user_id","updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "storefront_drafts_preview_token_uq" ON "storefront_drafts" USING btree ("preview_token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_storefront_active_created_idx" ON "products" USING btree ("storefront_id","is_active","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_seller_id_created_at_idx" ON "orders" USING btree ("seller_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_seller_id_status_idx" ON "orders" USING btree ("seller_id","status");--> statement-breakpoint
UPDATE "storefronts"
   SET "publish_state" = 'published',
       "last_published_at" = COALESCE("last_published_at", "updated_at")
 WHERE "is_published" = true;