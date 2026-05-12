import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
} from "drizzle-orm/pg-core"
import {
  documentTypeEnum,
  verificationStatusEnum,
  pennyDropStatusEnum,
  vpaStatusEnum,
} from "./enums"
import { users } from "./users"

// ─── KYC ──────────────────────────────────────────────────────────────────────
// Production schema: both PAN and Aadhaar are required (we collect number + a
// document file for each), and both UPI and bank account are required (UPI is
// the primary payout rail, bank is the fallback). Razorpay validates the bank
// account (penny-drop) and the UPI handle, returning the registered name —
// stored separately from the user-entered name so admin can compare.
export const kyc = pgTable("kyc", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),

  // ─── Identity ─────────────────────────────────────────────────────────────
  panNumber: varchar("pan_number", { length: 20 }),
  panFileUrl: text("pan_file_url"),
  panFileId: text("pan_file_id"),
  aadhaarNumber: varchar("aadhaar_number", { length: 20 }),
  aadhaarFileUrl: text("aadhaar_file_url"),
  aadhaarFileId: text("aadhaar_file_id"),

  // Legacy single-document fields. New submissions populate the pan/aadhaar
  // file fields above; these remain for back-compat with historical rows.
  documentType: documentTypeEnum("document_type"),
  documentFileUrl: text("document_file_url"),
  documentFileId: text("document_file_id"),

  // ─── Payment ──────────────────────────────────────────────────────────────
  upiId: varchar("upi_id", { length: 255 }),
  vpaStatus: vpaStatusEnum("vpa_status").notNull().default("pending"),
  vpaHolderName: text("vpa_holder_name"),

  accountHolderName: varchar("account_holder_name", { length: 255 }).notNull(),
  // Length matches the Zod schema (lib/validations/kyc.ts) — Indian bank
  // account numbers are 9–18 digits.
  accountNumber: varchar("account_number", { length: 18 }).notNull(),
  ifscCode: varchar("ifsc_code", { length: 20 }).notNull(),
  bankName: varchar("bank_name", { length: 255 }).notNull(),
  pennyDropStatus: pennyDropStatusEnum("penny_drop_status")
    .notNull()
    .default("pending"),
  bankHolderName: text("bank_holder_name"),

  // ─── Status ───────────────────────────────────────────────────────────────
  verificationStatus: verificationStatusEnum("verification_status")
    .notNull()
    .default("pending"),
  rejectionReason: text("rejection_reason"),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
