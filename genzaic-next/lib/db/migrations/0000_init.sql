CREATE TYPE "public"."coupon_scope" AS ENUM('platform', 'seller');--> statement-breakpoint
CREATE TYPE "public"."coupon_type" AS ENUM('percentage', 'fixed_amount');--> statement-breakpoint
CREATE TYPE "public"."delivery_status" AS ENUM('pending', 'delivered');--> statement-breakpoint
CREATE TYPE "public"."delivery_type" AS ENUM('download', 'external_link', 'manual');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('pan', 'aadhaar');--> statement-breakpoint
CREATE TYPE "public"."kyc_status" AS ENUM('not_submitted', 'pending', 'verified', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('order_placed', 'order_completed', 'product_published', 'kyc_submitted', 'kyc_approved', 'kyc_rejected', 'new_follower', 'new_review', 'payout_completed', 'payout_failed', 'coupon_received', 'price_drop', 'new_product_from_following', 'account_verified', 'welcome', 'system');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'completed');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('created', 'authorized', 'captured', 'failed');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."penny_drop_status" AS ENUM('pending', 'success', 'failed');--> statement-breakpoint
CREATE TYPE "public"."plan_type" AS ENUM('creator', 'startup', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."platform_fee_mode" AS ENUM('seller', 'buyer');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('buyer', 'seller', 'admin');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('not_submitted', 'pending', 'verified', 'rejected');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"icon_url" text,
	"parent_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"image_file_id" text,
	"alt_text" varchar(255),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"original_price" numeric(10, 2),
	"file_url" text,
	"file_id" text,
	"external_url" text,
	"stock" integer,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_variants_price_check" CHECK ("product_variants"."price" >= 0)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"storefront_id" uuid NOT NULL,
	"category_id" uuid,
	"title" varchar(500) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"original_price" numeric(10, 2),
	"cover_image_url" text,
	"cover_image_file_id" text,
	"file_url" text,
	"file_id" text,
	"delivery_type" "delivery_type" DEFAULT 'download' NOT NULL,
	"external_url" text,
	"seller_contact_email" varchar(255),
	"seller_contact_phone" varchar(50),
	"seller_contact_whatsapp" varchar(50),
	"subscription_duration" varchar(50),
	"seo_title" varchar(255),
	"seo_keywords" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"stock" integer,
	"downloads" integer DEFAULT 0 NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"avg_rating" numeric(2, 1) DEFAULT '0' NOT NULL,
	"total_reviews" integer DEFAULT 0 NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_price_check" CHECK ("products"."price" >= 0)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cart_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cart_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_id" uuid,
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cart_items_quantity_check" CHECK ("cart_items"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "carts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"session_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coupon_usages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coupon_id" uuid NOT NULL,
	"user_id" uuid,
	"order_id" uuid NOT NULL,
	"discount_amount" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text,
	"type" "coupon_type" NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"scope" "coupon_scope" NOT NULL,
	"seller_id" uuid,
	"min_order_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"max_discount_amount" numeric(10, 2),
	"usage_limit" integer,
	"per_user_limit" integer DEFAULT 1 NOT NULL,
	"used_count" integer DEFAULT 0 NOT NULL,
	"valid_from" timestamp NOT NULL,
	"valid_to" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code"),
	CONSTRAINT "coupons_value_check" CHECK ("coupons"."value" > 0),
	CONSTRAINT "coupons_valid_dates_check" CHECK ("coupons"."valid_from" < "coupons"."valid_to")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_id" uuid,
	"product_title" varchar(500) NOT NULL,
	"variant_name" varchar(255),
	"product_thumbnail" text,
	"product_description" text,
	"price" numeric(10, 2) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"delivery_type" "delivery_type" DEFAULT 'download' NOT NULL,
	"delivery_status" "delivery_status" DEFAULT 'pending',
	"external_url" text,
	"download_count" integer DEFAULT 0 NOT NULL,
	"max_downloads" integer DEFAULT 5 NOT NULL,
	"download_link" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "order_items_quantity_check" CHECK ("order_items"."quantity" > 0),
	CONSTRAINT "order_items_price_check" CHECK ("order_items"."price" >= 0)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" varchar(50) NOT NULL,
	"payment_id" uuid,
	"seller_id" uuid NOT NULL,
	"buyer_id" uuid,
	"buyer_email" varchar(255) NOT NULL,
	"buyer_name" varchar(255) NOT NULL,
	"buyer_phone" varchar(50),
	"buyer_gstin" varchar(50),
	"subtotal" numeric(10, 2) NOT NULL,
	"gst_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"platform_fee" numeric(10, 2) DEFAULT '0' NOT NULL,
	"discount_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"coupon_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"buyer_id" uuid,
	"buyer_email" varchar(255) NOT NULL,
	"razorpay_order_id" varchar(255) NOT NULL,
	"razorpay_payment_id" varchar(255),
	"razorpay_signature" varchar(512),
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"status" "payment_status" DEFAULT 'created' NOT NULL,
	"method" varchar(50),
	"bank" varchar(100),
	"wallet" varchar(50),
	"vpa" varchar(255),
	"error_code" varchar(100),
	"error_description" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(512) NOT NULL,
	"refresh_token" varchar(512),
	"ip_address" varchar(45),
	"user_agent" text,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255),
	"name" varchar(255) NOT NULL,
	"avatar_url" text,
	"avatar_file_id" text,
	"role" "user_role" DEFAULT 'buyer' NOT NULL,
	"is_seller" boolean DEFAULT false NOT NULL,
	"plan_type" "plan_type" DEFAULT 'creator' NOT NULL,
	"kyc_status" "kyc_status" DEFAULT 'not_submitted' NOT NULL,
	"onboarding_complete" boolean DEFAULT false NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"email_verification_token" varchar(255),
	"email_verification_expires_at" timestamp,
	"password_reset_token" varchar(255),
	"password_reset_expires_at" timestamp,
	"followers_count" integer DEFAULT 0 NOT NULL,
	"following_count" integer DEFAULT 0 NOT NULL,
	"total_products" integer DEFAULT 0 NOT NULL,
	"total_sales" integer DEFAULT 0 NOT NULL,
	"total_revenue" numeric(12, 2) DEFAULT '0' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_login_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "storefronts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"store_url" varchar(100),
	"store_name" varchar(255),
	"description" text,
	"profile_image_url" text,
	"profile_image_file_id" text,
	"cover_image_url" text,
	"cover_image_file_id" text,
	"tagline" varchar(255),
	"bio" text,
	"theme_id" varchar(50) DEFAULT 'modern' NOT NULL,
	"primary_color" varchar(20) DEFAULT '#6366f1' NOT NULL,
	"font_family" varchar(100) DEFAULT 'Inter' NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"platform_fee_mode" "platform_fee_mode" DEFAULT 'buyer' NOT NULL,
	"upi_id" varchar(255),
	"contact_email" varchar(255),
	"contact_phone" varchar(50),
	"contact_whatsapp" varchar(50),
	"social_instagram" text,
	"social_twitter" text,
	"social_youtube" text,
	"social_website" text,
	"seo_title" varchar(255),
	"seo_description" text,
	"seo_keywords" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "storefronts_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "storefronts_store_url_unique" UNIQUE("store_url")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "follows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"follower_id" uuid NOT NULL,
	"following_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "follows_no_self_follow" CHECK ("follows"."follower_id" != "follows"."following_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"buyer_id" uuid NOT NULL,
	"order_item_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"title" varchar(255),
	"body" text,
	"seller_reply" text,
	"seller_replied_at" timestamp,
	"is_verified_purchase" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_rating_range" CHECK ("reviews"."rating" >= 1 AND "reviews"."rating" <= 5)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wishlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"notification_type" "notification_type" NOT NULL,
	"in_app_enabled" boolean DEFAULT true NOT NULL,
	"email_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"link" text,
	"metadata" jsonb,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"email_sent" boolean DEFAULT false NOT NULL,
	"email_sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kyc" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"document_type" "document_type" NOT NULL,
	"pan_number" varchar(20),
	"aadhaar_number" varchar(20),
	"document_file_url" text,
	"document_file_id" text,
	"account_holder_name" varchar(255) NOT NULL,
	"account_number" varchar(50) NOT NULL,
	"ifsc_code" varchar(20) NOT NULL,
	"bank_name" varchar(255) NOT NULL,
	"verification_status" "verification_status" DEFAULT 'pending' NOT NULL,
	"penny_drop_status" "penny_drop_status" DEFAULT 'pending' NOT NULL,
	"rejection_reason" text,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "kyc_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "download_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_item_id" uuid NOT NULL,
	"product_title" varchar(500) NOT NULL,
	"buyer_name" varchar(255) NOT NULL,
	"buyer_email" varchar(255) NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"downloaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" "payout_status" DEFAULT 'pending' NOT NULL,
	"transaction_id" varchar(255),
	"utr_number" varchar(255),
	"failure_reason" text,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_storefront_id_storefronts_id_fk" FOREIGN KEY ("storefront_id") REFERENCES "public"."storefronts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coupons" ADD CONSTRAINT "coupons_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "storefronts" ADD CONSTRAINT "storefronts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews" ADD CONSTRAINT "reviews_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kyc" ADD CONSTRAINT "kyc_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "download_logs" ADD CONSTRAINT "download_logs_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payouts" ADD CONSTRAINT "payouts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "categories_parent_id_idx" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "categories_sort_order_idx" ON "categories" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "categories_is_active_idx" ON "categories" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_images_product_id_idx" ON "product_images" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_images_sort_order_idx" ON "product_images" USING btree ("sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "product_tags_unique_idx" ON "product_tags" USING btree ("product_id","tag_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_tags_tag_id_idx" ON "product_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_variants_product_id_idx" ON "product_variants" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_variants_sort_order_idx" ON "product_variants" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_storefront_id_idx" ON "products" USING btree ("storefront_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_category_id_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_is_active_idx" ON "products" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_created_at_idx" ON "products" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_deleted_at_idx" ON "products" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_price_idx" ON "products" USING btree ("price");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cart_items_cart_id_idx" ON "cart_items" USING btree ("cart_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "cart_items_unique_idx" ON "cart_items" USING btree ("cart_id","product_id","variant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "carts_user_id_idx" ON "carts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "carts_session_id_idx" ON "carts" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coupon_usages_coupon_id_idx" ON "coupon_usages" USING btree ("coupon_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coupon_usages_user_id_idx" ON "coupon_usages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coupon_usages_order_id_idx" ON "coupon_usages" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coupons_seller_id_idx" ON "coupons" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coupons_scope_idx" ON "coupons" USING btree ("scope");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coupons_is_active_idx" ON "coupons" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coupons_valid_range_idx" ON "coupons" USING btree ("valid_from","valid_to");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_items_order_id_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_items_product_id_idx" ON "order_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_items_variant_id_idx" ON "order_items" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_payment_id_idx" ON "orders" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_seller_id_idx" ON "orders" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_buyer_id_idx" ON "orders" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_buyer_email_idx" ON "orders" USING btree ("buyer_email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_coupon_id_idx" ON "orders" USING btree ("coupon_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_created_at_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payments_buyer_id_idx" ON "payments" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payments_buyer_email_idx" ON "payments" USING btree ("buyer_email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payments_razorpay_order_id_idx" ON "payments" USING btree ("razorpay_order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payments_created_at_idx" ON "payments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_is_seller_idx" ON "users" USING btree ("is_seller");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_is_active_idx" ON "users" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "storefronts_is_published_idx" ON "storefronts" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "storefronts_created_at_idx" ON "storefronts" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "follows_unique_idx" ON "follows" USING btree ("follower_id","following_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "follows_follower_id_idx" ON "follows" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "follows_following_id_idx" ON "follows" USING btree ("following_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reviews_product_id_idx" ON "reviews" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reviews_buyer_id_idx" ON "reviews" USING btree ("buyer_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "reviews_order_item_unique_idx" ON "reviews" USING btree ("order_item_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reviews_rating_idx" ON "reviews" USING btree ("rating");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reviews_created_at_idx" ON "reviews" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "wishlists_unique_idx" ON "wishlists" USING btree ("user_id","product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "wishlists_user_id_idx" ON "wishlists" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "wishlists_product_id_idx" ON "wishlists" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "notification_prefs_unique_idx" ON "notification_preferences" USING btree ("user_id","notification_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_user_unread_idx" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_type_idx" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "download_logs_order_item_id_idx" ON "download_logs" USING btree ("order_item_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "download_logs_downloaded_at_idx" ON "download_logs" USING btree ("downloaded_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payouts_user_id_idx" ON "payouts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payouts_status_idx" ON "payouts" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payouts_created_at_idx" ON "payouts" USING btree ("created_at");