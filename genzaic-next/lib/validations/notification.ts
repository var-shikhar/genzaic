import { z } from "zod"

const notificationTypes = [
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
] as const

export const updateNotificationPreferenceSchema = z.object({
  notificationType: z.enum(notificationTypes, {
    required_error: "Notification type is required",
  }),
  inAppEnabled: z.boolean(),
  emailEnabled: z.boolean(),
})

export const markNotificationsReadSchema = z.object({
  notificationIds: z
    .array(z.string().uuid("Invalid notification ID"))
    .min(1, "At least one notification ID is required"),
})

export const markAllReadSchema = z.object({
  beforeDate: z.coerce.date().optional(),
})

export type UpdateNotificationPreferenceInput = z.infer<typeof updateNotificationPreferenceSchema>
export type MarkNotificationsReadInput = z.infer<typeof markNotificationsReadSchema>
