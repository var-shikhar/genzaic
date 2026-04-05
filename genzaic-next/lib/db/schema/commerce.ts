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
import {
  orderStatusEnum,
  deliveryTypeEnum,
  deliveryStatusEnum,
  paymentStatusEnum,
  couponTypeEnum,
  couponScopeEnum,
} from "./enums"
import { users } from "./users"
import { products, productVariants } from "./catalog"

// ─── Coupons ──────────────────────────────────────────────────────────────────
export const coupons = pgTable(
  "coupons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    description: text("description"),
    type: couponTypeEnum("type").notNull(),
    value: decimal("value", { precision: 10, scale: 2 }).notNull(),
    scope: couponScopeEnum("scope").notNull(),
    sellerId: uuid("seller_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    minOrderAmount: decimal("min_order_amount", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    maxDiscountAmount: decimal("max_discount_amount", {
      precision: 10,
      scale: 2,
    }),
    usageLimit: integer("usage_limit"),
    perUserLimit: integer("per_user_limit").notNull().default(1),
    usedCount: integer("used_count").notNull().default(0),
    validFrom: timestamp("valid_from").notNull(),
    validTo: timestamp("valid_to").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("coupons_seller_id_idx").on(t.sellerId),
    index("coupons_scope_idx").on(t.scope),
    index("coupons_is_active_idx").on(t.isActive),
    index("coupons_valid_range_idx").on(t.validFrom, t.validTo),
    check("coupons_value_check", sql`${t.value} > 0`),
    check("coupons_valid_dates_check", sql`${t.validFrom} < ${t.validTo}`),
  ],
)

// ─── Carts ────────────────────────────────────────────────────────────────────
export const carts = pgTable(
  "carts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    sessionId: varchar("session_id", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("carts_user_id_idx").on(t.userId),
    index("carts_session_id_idx").on(t.sessionId),
  ],
)

// ─── Cart Items ───────────────────────────────────────────────────────────────
export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").references(() => productVariants.id, {
      onDelete: "set null",
    }),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("cart_items_cart_id_idx").on(t.cartId),
    uniqueIndex("cart_items_unique_idx").on(
      t.cartId,
      t.productId,
      t.variantId,
    ),
    check("cart_items_quantity_check", sql`${t.quantity} > 0`),
  ],
)

// ─── Payments (Razorpay) ─────────────────────────────────────────────────────
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    buyerId: uuid("buyer_id").references(() => users.id),
    buyerEmail: varchar("buyer_email", { length: 255 }).notNull(),
    razorpayOrderId: varchar("razorpay_order_id", { length: 255 }).notNull(),
    razorpayPaymentId: varchar("razorpay_payment_id", { length: 255 }),
    razorpaySignature: varchar("razorpay_signature", { length: 512 }),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 10 }).notNull().default("INR"),
    status: paymentStatusEnum("status").notNull().default("created"),
    method: varchar("method", { length: 50 }),
    bank: varchar("bank", { length: 100 }),
    wallet: varchar("wallet", { length: 50 }),
    vpa: varchar("vpa", { length: 255 }),
    errorCode: varchar("error_code", { length: 100 }),
    errorDescription: text("error_description"),
    attempts: integer("attempts").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("payments_buyer_id_idx").on(t.buyerId),
    index("payments_buyer_email_idx").on(t.buyerEmail),
    index("payments_razorpay_order_id_idx").on(t.razorpayOrderId),
    index("payments_status_idx").on(t.status),
    index("payments_created_at_idx").on(t.createdAt),
  ],
)

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
    paymentId: uuid("payment_id").references(() => payments.id),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => users.id),
    buyerId: uuid("buyer_id").references(() => users.id),
    buyerEmail: varchar("buyer_email", { length: 255 }).notNull(),
    buyerName: varchar("buyer_name", { length: 255 }).notNull(),
    buyerPhone: varchar("buyer_phone", { length: 50 }),
    buyerGstin: varchar("buyer_gstin", { length: 50 }),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    gstAmount: decimal("gst_amount", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    platformFee: decimal("platform_fee", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    discountAmount: decimal("discount_amount", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    status: orderStatusEnum("status").notNull().default("pending"),
    couponId: uuid("coupon_id").references(() => coupons.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("orders_payment_id_idx").on(t.paymentId),
    index("orders_seller_id_idx").on(t.sellerId),
    index("orders_buyer_id_idx").on(t.buyerId),
    index("orders_buyer_email_idx").on(t.buyerEmail),
    index("orders_status_idx").on(t.status),
    index("orders_coupon_id_idx").on(t.couponId),
    index("orders_created_at_idx").on(t.createdAt),
  ],
)

// ─── Order Items ──────────────────────────────────────────────────────────────
export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    variantId: uuid("variant_id").references(() => productVariants.id),
    productTitle: varchar("product_title", { length: 500 }).notNull(),
    variantName: varchar("variant_name", { length: 255 }),
    productThumbnail: text("product_thumbnail"),
    productDescription: text("product_description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    quantity: integer("quantity").notNull().default(1),
    deliveryType: deliveryTypeEnum("delivery_type")
      .notNull()
      .default("download"),
    deliveryStatus: deliveryStatusEnum("delivery_status").default("pending"),
    externalUrl: text("external_url"),
    downloadCount: integer("download_count").notNull().default(0),
    maxDownloads: integer("max_downloads").notNull().default(5),
    downloadLink: text("download_link"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("order_items_order_id_idx").on(t.orderId),
    index("order_items_product_id_idx").on(t.productId),
    index("order_items_variant_id_idx").on(t.variantId),
    check("order_items_quantity_check", sql`${t.quantity} > 0`),
    check("order_items_price_check", sql`${t.price} >= 0`),
  ],
)

// ─── Coupon Usages ────────────────────────────────────────────────────────────
export const couponUsages = pgTable(
  "coupon_usages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    couponId: uuid("coupon_id")
      .notNull()
      .references(() => coupons.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    discountAmount: decimal("discount_amount", { precision: 10, scale: 2 })
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("coupon_usages_coupon_id_idx").on(t.couponId),
    index("coupon_usages_user_id_idx").on(t.userId),
    index("coupon_usages_order_id_idx").on(t.orderId),
  ],
)
