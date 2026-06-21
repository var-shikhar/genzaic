import "server-only"
import { and, eq, ne, sql } from "drizzle-orm"
import { db, payments } from "@/lib/db"

/**
 * Marks a payment row `failed` from a Razorpay `payment.failed` webhook.
 *
 * Guarded against downgrading a captured payment: a buyer can retry on the
 * SAME Razorpay order, so a failed attempt and a successful attempt share one
 * `razorpayOrderId` (different payment ids). If the captured event already
 * landed (status = "captured"), we must NOT overwrite it back to "failed" —
 * hence the `status != "captured"` filter. Re-running on an already-failed row
 * is harmless (it just refreshes the error fields and bumps `attempts`).
 */
export async function markPaymentFailed(args: {
  razorpayOrderId: string
  razorpayPaymentId?: string | null
  errorCode?: string | null
  errorDescription?: string | null
  method?: string | null
  bank?: string | null
  wallet?: string | null
  vpa?: string | null
}): Promise<void> {
  await db
    .update(payments)
    .set({
      status: "failed",
      razorpayPaymentId: args.razorpayPaymentId ?? null,
      errorCode: args.errorCode ?? null,
      errorDescription: args.errorDescription ?? null,
      method: args.method ?? null,
      bank: args.bank ?? null,
      wallet: args.wallet ?? null,
      vpa: args.vpa ?? null,
      attempts: sql`${payments.attempts} + 1`,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(payments.razorpayOrderId, args.razorpayOrderId),
        ne(payments.status, "captured"),
      ),
    )
}
