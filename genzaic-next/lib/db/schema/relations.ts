import { relations } from "drizzle-orm"
import {
  categories,
  productImages,
  products,
  productTags,
  productVariants,
  tags,
} from "./catalog"
import {
  cartItems,
  carts,
  coupons,
  couponUsages,
  orderItems,
  orders,
  payments,
} from "./commerce"
import { feedbackSubmissions } from "./feedback"
import { kyc } from "./kyc"
import {
  notificationOutbox,
  notificationPreferences,
  notifications,
  userDevices,
} from "./notifications"
import { downloadLogs, payouts } from "./payouts"
import { follows, reviews, wishlists } from "./social"
import { storefrontDrafts } from "./storefront-drafts"
import { storefronts } from "./storefronts"
import { sessions, users } from "./users"

// ═══════════════════════════════════════════════════════════════════════════════
// USERS & AUTH
// ═══════════════════════════════════════════════════════════════════════════════

export const usersRelations = relations(users, ({ one, many }) => ({
  // one-to-one
  storefront: one(storefronts, {
    fields: [users.id],
    references: [storefronts.userId],
  }),
  kyc: one(kyc, { fields: [users.id], references: [kyc.userId] }),
  cart: one(carts, { fields: [users.id], references: [carts.userId] }),

  // one-to-many
  sessions: many(sessions),
  payouts: many(payouts),
  sellerOrders: many(orders, { relationName: "sellerOrders" }),
  buyerOrders: many(orders, { relationName: "buyerOrders" }),
  reviews: many(reviews),
  wishlists: many(wishlists),
  notifications: many(notifications),
  notificationPreferences: many(notificationPreferences),
  devices: many(userDevices),
  sellerCoupons: many(coupons),
  storefrontDrafts: many(storefrontDrafts),
  feedbackSubmissions: many(feedbackSubmissions),

  // follows (bidirectional)
  followers: many(follows, { relationName: "following" }),
  following: many(follows, { relationName: "follower" }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

// ═══════════════════════════════════════════════════════════════════════════════
// STOREFRONTS
// ═══════════════════════════════════════════════════════════════════════════════

export const storefrontsRelations = relations(storefronts, ({ one, many }) => ({
  user: one(users, { fields: [storefronts.userId], references: [users.id] }),
  products: many(products),
}))

export const storefrontDraftsRelations = relations(
  storefrontDrafts,
  ({ one }) => ({
    user: one(users, {
      fields: [storefrontDrafts.userId],
      references: [users.id],
    }),
  }),
)

// ═══════════════════════════════════════════════════════════════════════════════
// CATALOG
// ═══════════════════════════════════════════════════════════════════════════════

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "categoryHierarchy",
  }),
  children: many(categories, { relationName: "categoryHierarchy" }),
  products: many(products),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  productTags: many(productTags),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  storefront: one(storefronts, {
    fields: [products.storefrontId],
    references: [storefronts.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(productVariants),
  images: many(productImages),
  productTags: many(productTags),
  orderItems: many(orderItems),
  reviews: many(reviews),
  wishlists: many(wishlists),
  cartItems: many(cartItems),
}))

export const productTagsRelations = relations(productTags, ({ one }) => ({
  product: one(products, {
    fields: [productTags.productId],
    references: [products.id],
  }),
  tag: one(tags, { fields: [productTags.tagId], references: [tags.id] }),
}))

export const productVariantsRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    orderItems: many(orderItems),
    cartItems: many(cartItems),
  }),
)

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}))

// ═══════════════════════════════════════════════════════════════════════════════
// COMMERCE
// ═══════════════════════════════════════════════════════════════════════════════

export const couponsRelations = relations(coupons, ({ one, many }) => ({
  seller: one(users, { fields: [coupons.sellerId], references: [users.id] }),
  orders: many(orders),
  usages: many(couponUsages),
}))

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, { fields: [carts.userId], references: [users.id] }),
  items: many(cartItems),
}))

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [cartItems.variantId],
    references: [productVariants.id],
  }),
}))

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  buyer: one(users, { fields: [payments.buyerId], references: [users.id] }),
  orders: many(orders),
}))

export const ordersRelations = relations(orders, ({ one, many }) => ({
  payment: one(payments, {
    fields: [orders.paymentId],
    references: [payments.id],
  }),
  seller: one(users, {
    fields: [orders.sellerId],
    references: [users.id],
    relationName: "sellerOrders",
  }),
  buyer: one(users, {
    fields: [orders.buyerId],
    references: [users.id],
    relationName: "buyerOrders",
  }),
  coupon: one(coupons, {
    fields: [orders.couponId],
    references: [coupons.id],
  }),
  items: many(orderItems),
  couponUsage: many(couponUsages),
}))

export const orderItemsRelations = relations(orderItems, ({ one, many }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
  review: one(reviews, {
    fields: [orderItems.id],
    references: [reviews.orderItemId],
  }),
  downloadLogs: many(downloadLogs),
}))

export const couponUsagesRelations = relations(couponUsages, ({ one }) => ({
  coupon: one(coupons, {
    fields: [couponUsages.couponId],
    references: [coupons.id],
  }),
  user: one(users, {
    fields: [couponUsages.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [couponUsages.orderId],
    references: [orders.id],
  }),
}))

// ═══════════════════════════════════════════════════════════════════════════════
// SOCIAL
// ═══════════════════════════════════════════════════════════════════════════════

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  buyer: one(users, { fields: [reviews.buyerId], references: [users.id] }),
  orderItem: one(orderItems, {
    fields: [reviews.orderItemId],
    references: [orderItems.id],
  }),
}))

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}))

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, { fields: [wishlists.userId], references: [users.id] }),
  product: one(products, {
    fields: [wishlists.productId],
    references: [products.id],
  }),
}))

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const notificationsRelations = relations(
  notifications,
  ({ one, many }) => ({
    user: one(users, {
      fields: [notifications.userId],
      references: [users.id],
    }),
    outboxRows: many(notificationOutbox),
  }),
)

export const notificationPreferencesRelations = relations(
  notificationPreferences,
  ({ one }) => ({
    user: one(users, {
      fields: [notificationPreferences.userId],
      references: [users.id],
    }),
  }),
)

export const userDevicesRelations = relations(userDevices, ({ one }) => ({
  user: one(users, { fields: [userDevices.userId], references: [users.id] }),
}))

export const notificationOutboxRelations = relations(
  notificationOutbox,
  ({ one }) => ({
    notification: one(notifications, {
      fields: [notificationOutbox.notificationId],
      references: [notifications.id],
    }),
  }),
)

// ═══════════════════════════════════════════════════════════════════════════════
// KYC & PAYOUTS
// ═══════════════════════════════════════════════════════════════════════════════

export const kycRelations = relations(kyc, ({ one }) => ({
  user: one(users, { fields: [kyc.userId], references: [users.id] }),
}))

export const payoutsRelations = relations(payouts, ({ one }) => ({
  user: one(users, { fields: [payouts.userId], references: [users.id] }),
}))

export const downloadLogsRelations = relations(downloadLogs, ({ one }) => ({
  orderItem: one(orderItems, {
    fields: [downloadLogs.orderItemId],
    references: [orderItems.id],
  }),
}))

// ═══════════════════════════════════════════════════════════════════════════════
// FEEDBACK
// ═══════════════════════════════════════════════════════════════════════════════

export const feedbackSubmissionsRelations = relations(
  feedbackSubmissions,
  ({ one }) => ({
    user: one(users, {
      fields: [feedbackSubmissions.userId],
      references: [users.id],
    }),
  }),
)
