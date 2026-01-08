-- Add KYC table for user verification
-- Migration: 002_add_kyc_table

-- Create enums for KYC
CREATE TYPE "DocumentType" AS ENUM ('pan', 'aadhaar');
CREATE TYPE "PennyDropStatus" AS ENUM ('pending', 'success', 'failed');

-- Create KYC table
CREATE TABLE "kyc" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL UNIQUE,
  "document_type" "DocumentType" NOT NULL,
  "pan_number" VARCHAR(10),
  "aadhaar_number" VARCHAR(12),
  "document_file_url" TEXT,
  "account_holder_name" VARCHAR(255) NOT NULL,
  "account_number" VARCHAR(20) NOT NULL,
  "ifsc_code" VARCHAR(11) NOT NULL,
  "bank_name" VARCHAR(255) NOT NULL,
  "verification_status" "KycStatus" NOT NULL DEFAULT 'pending',
  "penny_drop_status" "PennyDropStatus" NOT NULL DEFAULT 'pending',
  "rejection_reason" TEXT,
  "verified_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT "kyc_user_id_fkey" FOREIGN KEY ("user_id")
    REFERENCES "users"("id") ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX "kyc_user_id_idx" ON "kyc"("user_id");
CREATE INDEX "kyc_verification_status_idx" ON "kyc"("verification_status");

-- Add comment
COMMENT ON TABLE "kyc" IS 'KYC (Know Your Customer) data for seller verification';
