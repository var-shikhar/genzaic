import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  decimal,
  integer,
  pgEnum,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// ─── Enums ────────────────────────────────────────────────────────────────────
export const userRoleEnum = pgEnum("user_role", ["buyer", "seller", "admin"])
export const kycStatusEnum = pgEnum("kyc_status", ["not_submitted", "pending", "verified", "rejected"])
export const planTypeEnum = pgEnum("plan_type", ["creator", "startup", "enterprise"])
export const orderStatusEnum = pgEnum("order_status", ["pending", "completed", "refunded"])
export const deliveryTypeEnum = pgEnum("delivery_type", ["download", "external_link", "manual"])
export const deliveryStatusEnum = pgEnum("delivery_status", ["pending", "delivered"])
export const payoutStatusEnum = pgEnum("payout_status", ["pending", "processing", "completed", "failed"])
export const platformFeeModeEnum = pgEnum("platform_fee_mode", ["seller", "buyer"])
export const documentTypeEnum = pgEnum("document_type", ["pan", "aadhaar"])
export const pennyDropStatusEnum = pgEnum("penny_drop_status", ["pending", "success", "failed"])
export const verificationStatusEnum = pgEnum("verification_status", ["not_submitted", "pending", "verified", "rejected"])

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  name: varchar("name", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),
  avatarFileId: text("avatar_file_id"),
  role: userRoleEnum("role").notNull().default("buyer"),
  isSeller: boolean("is_seller").notNull().default(false),
  storeUrl: varchar("store_url", { length: 100 }).unique(),
  planType: planTypeEnum("plan_type").notNull().default("creator"),
  kycStatus: kycStatusEnum("kyc_status").notNull().default("not_submitted"),
  onboardingComplete: boolean("onboarding_complete").notNull().default(false),
  emailVerified: boolean("email_verified").notNull().default(false),
  emailVerificationToken: varchar("email_verification_token", { length: 255 }),
  emailVerificationExpiresAt: timestamp("email_verification_expires_at"),
  passwordResetToken: varchar("password_reset_token", { length: 255 }),
  passwordResetExpiresAt: timestamp("password_reset_expires_at"),
  followersCount: integer("followers_count").notNull().default(0),
  totalProducts: integer("total_products").notNull().default(0),
  totalSales: integer("total_sales").notNull().default(0),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).notNull().default("0"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
})

// ─── Sessions ─────────────────────────────────────────────────────────────────
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 512 }).notNull().unique(),
  refreshToken: varchar("refresh_token", { length: 512 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── Storefronts ──────────────────────────────────────────────────────────────
export const storefronts = pgTable("storefronts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  storeUrl: varchar("store_url", { length: 100 }).unique(),
  storeName: varchar("store_name", { length: 255 }),
  description: text("description"),
  profileImageUrl: text("profile_image_url"),
  profileImageFileId: text("profile_image_file_id"),
  coverImageUrl: text("cover_image_url"),
  coverImageFileId: text("cover_image_file_id"),
  tagline: varchar("tagline", { length: 255 }),
  bio: text("bio"),
  themeId: varchar("theme_id", { length: 50 }).notNull().default("modern"),
  primaryColor: varchar("primary_color", { length: 20 }).notNull().default("#6366f1"),
  fontFamily: varchar("font_family", { length: 100 }).notNull().default("Inter"),
  isPublished: boolean("is_published").notNull().default(false),
  platformFeeMode: platformFeeModeEnum("platform_fee_mode").notNull().default("buyer"),
  upiId: varchar("upi_id", { length: 255 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  contactWhatsapp: varchar("contact_whatsapp", { length: 50 }),
  socialInstagram: text("social_instagram"),
  socialTwitter: text("social_twitter"),
  socialYoutube: text("social_youtube"),
  socialWebsite: text("social_website"),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── Products ─────────────────────────────────────────────────────────────────
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  storefrontId: uuid("storefront_id").notNull().references(() => storefronts.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  fileUrl: text("file_url"),
  fileId: text("file_id"),
  thumbnailUrl: text("thumbnail_url"),
  thumbnailFileId: text("thumbnail_file_id"),
  deliveryType: deliveryTypeEnum("delivery_type").notNull().default("download"),
  externalUrl: text("external_url"),
  sellerContactEmail: varchar("seller_contact_email", { length: 255 }),
  sellerContactPhone: varchar("seller_contact_phone", { length: 50 }),
  sellerContactWhatsapp: varchar("seller_contact_whatsapp", { length: 50 }),
  subscriptionDuration: varchar("subscription_duration", { length: 50 }),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoKeywords: text("seo_keywords"),
  isActive: boolean("is_active").notNull().default(true),
  stock: integer("stock"),
  downloads: integer("downloads").notNull().default(0),
  views: integer("views").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  sellerId: uuid("seller_id").notNull().references(() => users.id),
  buyerId: uuid("buyer_id").references(() => users.id),
  productId: uuid("product_id").notNull().references(() => products.id),
  productTitle: varchar("product_title", { length: 500 }).notNull(),
  productThumbnail: text("product_thumbnail"),
  productDescription: text("product_description"),
  buyerEmail: varchar("buyer_email", { length: 255 }).notNull(),
  buyerName: varchar("buyer_name", { length: 255 }).notNull(),
  buyerPhone: varchar("buyer_phone", { length: 50 }),
  buyerGstin: varchar("buyer_gstin", { length: 50 }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  gstAmount: decimal("gst_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull().default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  deliveryType: deliveryTypeEnum("delivery_type").notNull().default("download"),
  deliveryStatus: deliveryStatusEnum("delivery_status").default("pending"),
  externalUrl: text("external_url"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentId: varchar("payment_id", { length: 255 }),
  downloadCount: integer("download_count").notNull().default(0),
  maxDownloads: integer("max_downloads").notNull().default(5),
  downloadLink: text("download_link"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── KYC ──────────────────────────────────────────────────────────────────────
export const kyc = pgTable("kyc", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  documentType: documentTypeEnum("document_type").notNull(),
  panNumber: varchar("pan_number", { length: 20 }),
  aadhaarNumber: varchar("aadhaar_number", { length: 20 }),
  documentFileUrl: text("document_file_url"),
  documentFileId: text("document_file_id"),
  accountHolderName: varchar("account_holder_name", { length: 255 }).notNull(),
  accountNumber: varchar("account_number", { length: 50 }).notNull(),
  ifscCode: varchar("ifsc_code", { length: 20 }).notNull(),
  bankName: varchar("bank_name", { length: 255 }).notNull(),
  verificationStatus: verificationStatusEnum("verification_status").notNull().default("pending"),
  pennyDropStatus: pennyDropStatusEnum("penny_drop_status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── Payouts ──────────────────────────────────────────────────────────────────
export const payouts = pgTable("payouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: payoutStatusEnum("status").notNull().default("pending"),
  transactionId: varchar("transaction_id", { length: 255 }),
  utrNumber: varchar("utr_number", { length: 255 }),
  failureReason: text("failure_reason"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// ─── Download Logs ────────────────────────────────────────────────────────────
export const downloadLogs = pgTable("download_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productTitle: varchar("product_title", { length: 500 }).notNull(),
  buyerName: varchar("buyer_name", { length: 255 }).notNull(),
  buyerEmail: varchar("buyer_email", { length: 255 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  downloadedAt: timestamp("downloaded_at").notNull().defaultNow(),
})

// ─── Relations ────────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ one, many }) => ({
  storefront: one(storefronts, { fields: [users.id], references: [storefronts.userId] }),
  kyc: one(kyc, { fields: [users.id], references: [kyc.userId] }),
  sessions: many(sessions),
  payouts: many(payouts),
  sellerOrders: many(orders, { relationName: "sellerOrders" }),
  buyerOrders: many(orders, { relationName: "buyerOrders" }),
}))

export const storefrontsRelations = relations(storefronts, ({ one, many }) => ({
  user: one(users, { fields: [storefronts.userId], references: [users.id] }),
  products: many(products),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  storefront: one(storefronts, { fields: [products.storefrontId], references: [storefronts.id] }),
  orders: many(orders),
}))

export const ordersRelations = relations(orders, ({ one, many }) => ({
  seller: one(users, { fields: [orders.sellerId], references: [users.id], relationName: "sellerOrders" }),
  buyer: one(users, { fields: [orders.buyerId], references: [users.id], relationName: "buyerOrders" }),
  product: one(products, { fields: [orders.productId], references: [products.id] }),
  downloadLogs: many(downloadLogs),
}))

export const kycRelations = relations(kyc, ({ one }) => ({
  user: one(users, { fields: [kyc.userId], references: [users.id] }),
}))

export const payoutsRelations = relations(payouts, ({ one }) => ({
  user: one(users, { fields: [payouts.userId], references: [users.id] }),
}))

export const downloadLogsRelations = relations(downloadLogs, ({ one }) => ({
  order: one(orders, { fields: [downloadLogs.orderId], references: [orders.id] }),
}))

// ─── Type Exports ─────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Storefront = typeof storefronts.$inferSelect
export type NewStorefront = typeof storefronts.$inferInsert
export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
export type Kyc = typeof kyc.$inferSelect
export type NewKyc = typeof kyc.$inferInsert
export type Payout = typeof payouts.$inferSelect
export type DownloadLog = typeof downloadLogs.$inferSelect
