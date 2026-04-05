import { sql } from "drizzle-orm"
import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core"
import { users } from "./users"
import { products } from "./catalog"
import { orderItems } from "./commerce"

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    buyerId: uuid("buyer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    orderItemId: uuid("order_item_id")
      .notNull()
      .references(() => orderItems.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    title: varchar("title", { length: 255 }),
    body: text("body"),
    sellerReply: text("seller_reply"),
    sellerRepliedAt: timestamp("seller_replied_at"),
    isVerifiedPurchase: boolean("is_verified_purchase")
      .notNull()
      .default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("reviews_product_id_idx").on(t.productId),
    index("reviews_buyer_id_idx").on(t.buyerId),
    uniqueIndex("reviews_order_item_unique_idx").on(t.orderItemId),
    index("reviews_rating_idx").on(t.rating),
    index("reviews_created_at_idx").on(t.createdAt),
    check("reviews_rating_range", sql`${t.rating} >= 1 AND ${t.rating} <= 5`),
  ],
)

// ─── Follows ──────────────────────────────────────────────────────────────────
export const follows = pgTable(
  "follows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    followerId: uuid("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: uuid("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("follows_unique_idx").on(t.followerId, t.followingId),
    index("follows_follower_id_idx").on(t.followerId),
    index("follows_following_id_idx").on(t.followingId),
    check(
      "follows_no_self_follow",
      sql`${t.followerId} != ${t.followingId}`,
    ),
  ],
)

// ─── Wishlists ────────────────────────────────────────────────────────────────
export const wishlists = pgTable(
  "wishlists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("wishlists_unique_idx").on(t.userId, t.productId),
    index("wishlists_user_id_idx").on(t.userId),
    index("wishlists_product_id_idx").on(t.productId),
  ],
)
