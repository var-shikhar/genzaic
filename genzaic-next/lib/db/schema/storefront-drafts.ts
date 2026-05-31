import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  text,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { users } from "./users"
import type { DraftContent } from "@/lib/validations/storefront"

// Multi-draft model: sellers can keep N named drafts in flight; publishing
// promotes a draft's `content` blob onto the live `storefronts` row.
export const storefrontDrafts = pgTable(
  "storefront_drafts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 80 }).notNull(),
    description: text("description"),
    content: jsonb("content").notNull().$type<DraftContent>(),
    previewToken: text("preview_token"),
    // The "Default" version that every seller gets auto-provisioned with.
    // Cannot be deleted — guarantees there's always at least one draft to
    // fall back to when other drafts are removed.
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("storefront_drafts_user_id_idx").on(t.userId),
    index("storefront_drafts_user_updated_idx").on(t.userId, t.updatedAt),
    uniqueIndex("storefront_drafts_preview_token_uq").on(t.previewToken),
    // One default per user — enforced at the DB level so race conditions in
    // the auto-provisioning path cannot produce two defaults.
    uniqueIndex("storefront_drafts_default_per_user_uq")
      .on(t.userId)
      .where(sql`${t.isDefault} = true`),
  ],
)
