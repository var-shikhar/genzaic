import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  decimal,
  integer,
  index,
} from "drizzle-orm/pg-core"
import { userRoleEnum, planTypeEnum, kycStatusEnum } from "./enums"

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }),
    name: varchar("name", { length: 255 }).notNull(),
    avatarUrl: text("avatar_url"),
    avatarFileId: text("avatar_file_id"),
    role: userRoleEnum("role").notNull().default("buyer"),
    isSeller: boolean("is_seller").notNull().default(false),
    planType: planTypeEnum("plan_type").notNull().default("creator"),
    kycStatus: kycStatusEnum("kyc_status").notNull().default("not_submitted"),
    onboardingComplete: boolean("onboarding_complete")
      .notNull()
      .default(false),
    emailVerified: boolean("email_verified").notNull().default(false),
    emailVerificationToken: varchar("email_verification_token", {
      length: 255,
    }),
    emailVerificationExpiresAt: timestamp("email_verification_expires_at"),
    passwordResetToken: varchar("password_reset_token", { length: 255 }),
    passwordResetExpiresAt: timestamp("password_reset_expires_at"),
    followersCount: integer("followers_count").notNull().default(0),
    followingCount: integer("following_count").notNull().default(0),
    totalProducts: integer("total_products").notNull().default(0),
    totalSales: integer("total_sales").notNull().default(0),
    totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    lastLoginAt: timestamp("last_login_at"),
  },
  (t) => [
    index("users_role_idx").on(t.role),
    index("users_is_seller_idx").on(t.isSeller),
    index("users_is_active_idx").on(t.isActive),
    index("users_created_at_idx").on(t.createdAt),
  ],
)

// ─── Sessions ─────────────────────────────────────────────────────────────────
export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 512 }).notNull().unique(),
    refreshToken: varchar("refresh_token", { length: 512 }),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("sessions_user_id_idx").on(t.userId),
    index("sessions_expires_at_idx").on(t.expiresAt),
  ],
)
