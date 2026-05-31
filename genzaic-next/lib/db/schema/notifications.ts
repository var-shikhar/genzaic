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
  integer,
} from "drizzle-orm/pg-core"
import {
  notificationTypeEnum,
  notificationOutboxChannelEnum,
  notificationOutboxStatusEnum,
} from "./enums"
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

// ─── User Devices (FCM tokens) ────────────────────────────────────────────────
export const userDevices = pgTable(
  "user_devices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    fcmToken: text("fcm_token").notNull(),
    userAgent: text("user_agent"),
    lastSeenAt: timestamp("last_seen_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("user_devices_token_idx").on(t.fcmToken),
    index("user_devices_user_idx").on(t.userId),
  ],
)

// ─── Notification Outbox ──────────────────────────────────────────────────────
export const notificationOutbox = pgTable(
  "notification_outbox",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    notificationId: uuid("notification_id")
      .notNull()
      .references(() => notifications.id, { onDelete: "cascade" }),
    channel: notificationOutboxChannelEnum("channel").notNull(),
    status: notificationOutboxStatusEnum("status").notNull().default("pending"),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),
    nextAttemptAt: timestamp("next_attempt_at").notNull().defaultNow(),
    sentAt: timestamp("sent_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    // Composite index supports worker poll: WHERE status='pending' AND next_attempt_at <= now() ORDER BY next_attempt_at
    index("notif_outbox_pending_idx").on(t.status, t.nextAttemptAt),
    index("notif_outbox_notification_idx").on(t.notificationId),
  ],
)
