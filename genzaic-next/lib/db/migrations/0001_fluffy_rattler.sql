DO $$ BEGIN
 CREATE TYPE "public"."cover_preset" AS ENUM('ink', 'sunlit', 'stamp', 'studio', 'archive', 'riso');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."imprint_accent" AS ENUM('iris', 'sage', 'ink_blue', 'plum', 'ochre', 'slate');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_pairing" AS ENUM('house', 'press', 'studio', 'plain');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "slug" varchar(600);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "hex_code" varchar(4);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "default_product_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "storefronts" ADD COLUMN IF NOT EXISTS "imprint_slug" varchar(64);--> statement-breakpoint
ALTER TABLE "storefronts" ADD COLUMN IF NOT EXISTS "imprint_name" varchar(255);--> statement-breakpoint
ALTER TABLE "storefronts" ADD COLUMN IF NOT EXISTS "imprint_tagline" varchar(80);--> statement-breakpoint
ALTER TABLE "storefronts" ADD COLUMN IF NOT EXISTS "imprint_editors_note" varchar(140);--> statement-breakpoint
ALTER TABLE "storefronts" ADD COLUMN IF NOT EXISTS "imprint_cover_preset" "cover_preset" DEFAULT 'ink' NOT NULL;--> statement-breakpoint
ALTER TABLE "storefronts" ADD COLUMN IF NOT EXISTS "imprint_type_pairing" "type_pairing" DEFAULT 'house' NOT NULL;--> statement-breakpoint
ALTER TABLE "storefronts" ADD COLUMN IF NOT EXISTS "imprint_accent" "imprint_accent" DEFAULT 'iris' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "products_slug_storefront_idx" ON "products" USING btree ("storefront_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "storefronts_imprint_slug_idx" ON "storefronts" USING btree ("imprint_slug");
