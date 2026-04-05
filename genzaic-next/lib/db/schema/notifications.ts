import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core"
import { notificationTypeEnum } from "./enums"
import { users } from "./users"

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    link: text("link"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    isRead: boolean("is_read").notNull().default(false),
    readAt: timestamp("read_at"),
    emailSent: boolean("email_sent").notNull().default(false),
    emailSentAt: timestamp("email_sent_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("notifications_user_id_idx").on(t.userId),
    index("notifications_user_unread_idx").on(t.userId, t.isRead),
    index("notifications_type_idx").on(t.type),
    index("notifications_created_at_idx").on(t.createdAt),
  ],
)

// ─── Notification Preferences ─────────────────────────────────────────────────
export const notificationPreferences = pgTable(
  "notification_preferences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    notificationType: notificationTypeEnum("notification_type").notNull(),
    inAppEnabled: boolean("in_app_enabled").notNull().default(true),
    emailEnabled: boolean("email_enabled").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("notification_prefs_unique_idx").on(
      t.userId,
      t.notificationType,
    ),
  ],
)
