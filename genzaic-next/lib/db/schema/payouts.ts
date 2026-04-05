import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  decimal,
  index,
} from "drizzle-orm/pg-core"
import { payoutStatusEnum } from "./enums"
import { users } from "./users"
import { orderItems } from "./commerce"

// ─── Payouts ──────────────────────────────────────────────────────────────────
export const payouts = pgTable(
  "payouts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    status: payoutStatusEnum("status").notNull().default("pending"),
    transactionId: varchar("transaction_id", { length: 255 }),
    utrNumber: varchar("utr_number", { length: 255 }),
    failureReason: text("failure_reason"),
    processedAt: timestamp("processed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("payouts_user_id_idx").on(t.userId),
    index("payouts_status_idx").on(t.status),
    index("payouts_created_at_idx").on(t.createdAt),
  ],
)

// ─── Download Logs ────────────────────────────────────────────────────────────
export const downloadLogs = pgTable(
  "download_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderItemId: uuid("order_item_id")
      .notNull()
      .references(() => orderItems.id, { onDelete: "cascade" }),
    productTitle: varchar("product_title", { length: 500 }).notNull(),
    buyerName: varchar("buyer_name", { length: 255 }).notNull(),
    buyerEmail: varchar("buyer_email", { length: 255 }).notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    downloadedAt: timestamp("downloaded_at").notNull().defaultNow(),
  },
  (t) => [
    index("download_logs_order_item_id_idx").on(t.orderItemId),
    index("download_logs_downloaded_at_idx").on(t.downloadedAt),
  ],
)
