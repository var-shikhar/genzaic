import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core"
import { platformFeeModeEnum } from "./enums"
import { users } from "./users"

// ─── Storefronts ──────────────────────────────────────────────────────────────
export const storefronts = pgTable(
  "storefronts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
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
    primaryColor: varchar("primary_color", { length: 20 })
      .notNull()
      .default("#6366f1"),
    fontFamily: varchar("font_family", { length: 100 })
      .notNull()
      .default("Inter"),
    isPublished: boolean("is_published").notNull().default(false),
    platformFeeMode: platformFeeModeEnum("platform_fee_mode")
      .notNull()
      .default("buyer"),
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
  },
  (t) => [
    index("storefronts_is_published_idx").on(t.isPublished),
    index("storefronts_created_at_idx").on(t.createdAt),
  ],
)
