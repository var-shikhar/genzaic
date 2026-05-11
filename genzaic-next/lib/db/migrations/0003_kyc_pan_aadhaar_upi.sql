CREATE TYPE "public"."vpa_status" AS ENUM('pending', 'success', 'failed', 'error');--> statement-breakpoint
ALTER TABLE "kyc" ALTER COLUMN "document_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "kyc" ADD COLUMN "pan_file_url" text;--> statement-breakpoint
ALTER TABLE "kyc" ADD COLUMN "pan_file_id" text;--> statement-breakpoint
ALTER TABLE "kyc" ADD COLUMN "aadhaar_file_url" text;--> statement-breakpoint
ALTER TABLE "kyc" ADD COLUMN "aadhaar_file_id" text;--> statement-breakpoint
ALTER TABLE "kyc" ADD COLUMN "upi_id" varchar(255);--> statement-breakpoint
ALTER TABLE "kyc" ADD COLUMN "vpa_status" "vpa_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "kyc" ADD COLUMN "vpa_holder_name" text;--> statement-breakpoint
ALTER TABLE "kyc" ADD COLUMN "bank_holder_name" text;