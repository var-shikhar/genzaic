import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core"
import { feedbackKindEnum, feedbackStatusEnum } from "./enums"
import { users } from "./users"

/** Shape of a single bug-report attachment, as stored in the jsonb column. */
export interface FeedbackAttachment {
  url: string
  fileId: string
  name: string
  size: number
}

export const feedbackSubmissions = pgTable(
  "feedback_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: feedbackKindEnum("kind").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description").notNull(),
    attachments: jsonb("attachments")
      .$type<FeedbackAttachment[]>()
      .notNull()
      .default([]),
    status: feedbackStatusEnum("status").notNull().default("open"),
    // Auto-captured context for bug reports — which page they were on and what
    // browser they used. Null for feature requests.
    pageUrl: text("page_url"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("feedback_user_id_idx").on(t.userId),
    index("feedback_kind_idx").on(t.kind),
    index("feedback_status_idx").on(t.status),
    index("feedback_created_at_idx").on(t.createdAt),
  ],
)
