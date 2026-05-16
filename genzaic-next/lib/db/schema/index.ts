// ─── Re-exports ───────────────────────────────────────────────────────────────
export * from "./enums"
export * from "./users"
export * from "./storefronts"
export * from "./catalog"
export * from "./commerce"
export * from "./social"
export * from "./notifications"
export * from "./kyc"
export * from "./payouts"
export * from "./relations"

// ─── Type Exports ─────────────────────────────────────────────────────────────
import { users, sessions } from "./users"
import { storefronts } from "./storefronts"
import { categories, tags, products, productVariants, productImages, productTags } from "./catalog"
import { carts, cartItems, coupons, orders, orderItems, payments, couponUsages, orderAccessTokens } from "./commerce"
import { reviews, follows, wishlists } from "./social"
import { notifications, notificationPreferences } from "./notifications"
import { kyc } from "./kyc"
import { payouts, downloadLogs } from "./payouts"

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Session = typeof sessions.$inferSelect
export type Storefront = typeof storefronts.$inferSelect
export type NewStorefront = typeof storefronts.$inferInsert
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
export type Kyc = typeof kyc.$inferSelect
export type NewKyc = typeof kyc.$inferInsert
export type Payout = typeof payouts.$inferSelect
export type DownloadLog = typeof downloadLogs.$inferSelect
