// ─── Re-exports ───────────────────────────────────────────────────────────────
export * from "./catalog"
export * from "./commerce"
export * from "./enums"
export * from "./feedback"
export * from "./kyc"
export * from "./notifications"
export * from "./payouts"
export * from "./relations"
export * from "./social"
export * from "./storefront-drafts"
export * from "./storefronts"
export * from "./users"

// ─── Type Exports ─────────────────────────────────────────────────────────────
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
  orderAccessTokens,
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

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Session = typeof sessions.$inferSelect
export type Storefront = typeof storefronts.$inferSelect
export type NewStorefront = typeof storefronts.$inferInsert
export type StorefrontDraft = typeof storefrontDrafts.$inferSelect
export type NewStorefrontDraft = typeof storefrontDrafts.$inferInsert
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Tag = typeof tags.$inferSelect
export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export type ProductTag = typeof productTags.$inferSelect
export type ProductVariant = typeof productVariants.$inferSelect
export type NewProductVariant = typeof productVariants.$inferInsert
export type ProductImage = typeof productImages.$inferSelect
export type Cart = typeof carts.$inferSelect
export type CartItem = typeof cartItems.$inferSelect
export type Coupon = typeof coupons.$inferSelect
export type NewCoupon = typeof coupons.$inferInsert
export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
export type OrderItem = typeof orderItems.$inferSelect
export type NewOrderItem = typeof orderItems.$inferInsert
export type Payment = typeof payments.$inferSelect
export type CouponUsage = typeof couponUsages.$inferSelect
export type OrderAccessToken = typeof orderAccessTokens.$inferSelect
export type NewOrderAccessToken = typeof orderAccessTokens.$inferInsert
export type Review = typeof reviews.$inferSelect
export type NewReview = typeof reviews.$inferInsert
export type Follow = typeof follows.$inferSelect
export type Wishlist = typeof wishlists.$inferSelect
export type Notification = typeof notifications.$inferSelect
export type NotificationPreference = typeof notificationPreferences.$inferSelect
export type UserDevice = typeof userDevices.$inferSelect
export type NewUserDevice = typeof userDevices.$inferInsert
export type NotificationOutbox = typeof notificationOutbox.$inferSelect
export type NewNotificationOutbox = typeof notificationOutbox.$inferInsert
export type Kyc = typeof kyc.$inferSelect
export type NewKyc = typeof kyc.$inferInsert
export type Payout = typeof payouts.$inferSelect
export type DownloadLog = typeof downloadLogs.$inferSelect
export type FeedbackSubmission = typeof feedbackSubmissions.$inferSelect
export type NewFeedbackSubmission = typeof feedbackSubmissions.$inferInsert
