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
} from "./enums"
import { users } from "./users"

// ─── KYC ──────────────────────────────────────────────────────────────────────
export const kyc = pgTable("kyc", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  documentType: documentTypeEnum("document_type").notNull(),
  panNumber: varchar("pan_number", { length: 20 }),
  aadhaarNumber: varchar("aadhaar_number", { length: 20 }),
  documentFileUrl: text("document_file_url"),
  documentFileId: text("document_file_id"),
  accountHolderName: varchar("account_holder_name", { length: 255 }).notNull(),
  accountNumber: varchar("account_number", { length: 50 }).notNull(),
  ifscCode: varchar("ifsc_code", { length: 20 }).notNull(),
  bankName: varchar("bank_name", { length: 255 }).notNull(),
  verificationStatus: verificationStatusEnum("verification_status")
    .notNull()
    .default("pending"),
  pennyDropStatus: pennyDropStatusEnum("penny_drop_status")
    .notNull()
    .default("pending"),
  rejectionReason: text("rejection_reason"),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
