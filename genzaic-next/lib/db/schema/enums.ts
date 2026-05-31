import { pgEnum } from "drizzle-orm/pg-core"

// ─── User & Auth ──────────────────────────────────────────────────────────────
export const userRoleEnum = pgEnum("user_role", ["buyer", "seller", "admin"])
export const planTypeEnum = pgEnum("plan_type", ["creator", "startup", "enterprise"])

// ─── KYC & Verification ──────────────────────────────────────────────────────
export const kycStatusEnum = pgEnum("kyc_status", [
  "not_submitted",
  "pending",
  "verified",
  "rejected",
])
export const verificationStatusEnum = pgEnum("verification_status", [
  "not_submitted",
  "pending",
  "verified",
  "rejected",
])
export const documentTypeEnum = pgEnum("document_type", ["pan", "aadhaar"])
export const pennyDropStatusEnum = pgEnum("penny_drop_status", [
  "pending",
  "success",
  "failed",
])
// VPA (UPI handle) validation result from Razorpay's fund_accounts/validations.
// `error` distinguishes infra failures (Razorpay 5xx, missing env, network) from
// genuine validation failures, so admin can re-trigger errors without rejecting.
export const vpaStatusEnum = pgEnum("vpa_status", [
  "pending",
  "success",
  "failed",
  "error",
])

// ─── Product & Delivery ──────────────────────────────────────────────────────
export const deliveryTypeEnum = pgEnum("delivery_type", [
  "download",
  "external_link",
  "manual",
])
export const deliveryStatusEnum = pgEnum("delivery_status", [
  "pending",
  "delivered",
])

// ─── Commerce ─────────────────────────────────────────────────────────────────
export const orderStatusEnum = pgEnum("order_status", ["pending", "completed"])
export const platformFeeModeEnum = pgEnum("platform_fee_mode", [
  "seller",
  "buyer",
])
export const payoutStatusEnum = pgEnum("payout_status", [
  "pending",
  "processing",
  "completed",
  "failed",
])
export const paymentStatusEnum = pgEnum("payment_status", [
  "created",
  "authorized",
  "captured",
  "failed",
])
export const couponTypeEnum = pgEnum("coupon_type", [
  "percentage",
  "fixed_amount",
])
export const couponScopeEnum = pgEnum("coupon_scope", ["platform", "seller"])

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationTypeEnum = pgEnum("notification_type", [
  "order_placed",
  "order_completed",
  "product_published",
  "kyc_submitted",
  "kyc_approved",
  "kyc_rejected",
  "new_follower",
  "new_review",
  "payout_completed",
  "payout_failed",
  "coupon_received",
  "price_drop",
  "new_product_from_following",
  "account_verified",
  "welcome",
  "system",
])
export const notificationOutboxChannelEnum = pgEnum(
  "notification_outbox_channel",
  ["push", "email"],
)
export const notificationOutboxStatusEnum = pgEnum(
  "notification_outbox_status",
  ["pending", "sent", "failed", "skipped"],
)

// ─── Imprint customization (Editorial OS) ────────────────────────────────────
export const coverPresetEnum = pgEnum("cover_preset", [
  "ink",
  "sunlit",
  "stamp",
  "studio",
  "archive",
  "riso",
  "mono",
  "sage",
  "linen",
  "noir",
])

export const typePairingEnum = pgEnum("type_pairing", [
  "house",
  "press",
  "studio",
  "plain",
])

export const imprintAccentEnum = pgEnum("imprint_accent", [
  "iris",
  "sage",
  "ink_blue",
  "plum",
  "ochre",
  "slate",
])

// ─── Storefront publish state ─────────────────────────────────────────────────
export const publishStateEnum = pgEnum("publish_state", [
  "never_published",
  "published",
  "unpublished",
])
