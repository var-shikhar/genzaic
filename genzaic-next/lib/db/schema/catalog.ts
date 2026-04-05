import { sql } from "drizzle-orm"
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
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core"
import { deliveryTypeEnum } from "./enums"
import { storefronts } from "./storefronts"

// ─── Categories ───────────────────────────────────────────────────────────────
export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    description: text("description"),
    iconUrl: text("icon_url"),
    parentId: uuid("parent_id"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("categories_parent_id_idx").on(t.parentId),
    index("categories_sort_order_idx").on(t.sortOrder),
    index("categories_is_active_idx").on(t.isActive),
  ],
)

// ─── Tags ─────────────────────────────────────────────────────────────────────
export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// ─── Products ─────────────────────────────────────────────────────────────────
export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storefrontId: uuid("storefront_id")
      .notNull()
      .references(() => storefronts.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
    coverImageUrl: text("cover_image_url"),
    coverImageFileId: text("cover_image_file_id"),
    fileUrl: text("file_url"),
    fileId: text("file_id"),
    deliveryType: deliveryTypeEnum("delivery_type")
      .notNull()
      .default("download"),
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
    avgRating: decimal("avg_rating", { precision: 2, scale: 1 })
      .notNull()
      .default("0"),
    totalReviews: integer("total_reviews").notNull().default(0),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("products_storefront_id_idx").on(t.storefrontId),
    index("products_category_id_idx").on(t.categoryId),
    index("products_is_active_idx").on(t.isActive),
    index("products_created_at_idx").on(t.createdAt),
    index("products_deleted_at_idx").on(t.deletedAt),
    index("products_price_idx").on(t.price),
    check("products_price_check", sql`${t.price} >= 0`),
  ],
)

// ─── Product Tags (many-to-many) ─────────────────────────────────────────────
export const productTags = pgTable(
  "product_tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("product_tags_unique_idx").on(t.productId, t.tagId),
    index("product_tags_tag_id_idx").on(t.tagId),
  ],
)

// ─── Product Variants ─────────────────────────────────────────────────────────
export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
    fileUrl: text("file_url"),
    fileId: text("file_id"),
    externalUrl: text("external_url"),
    stock: integer("stock"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("product_variants_product_id_idx").on(t.productId),
    index("product_variants_sort_order_idx").on(t.sortOrder),
    check("product_variants_price_check", sql`${t.price} >= 0`),
  ],
)

// ─── Product Images (gallery) ─────────────────────────────────────────────────
export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    imageFileId: text("image_file_id"),
    altText: varchar("alt_text", { length: 255 }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("product_images_product_id_idx").on(t.productId),
    index("product_images_sort_order_idx").on(t.sortOrder),
  ],
)
