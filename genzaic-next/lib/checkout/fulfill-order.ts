import "server-only"
import { after } from "next/server"
import { eq, sql } from "drizzle-orm"
import { db, payments, orders, orderItems, products, users } from "@/lib/db"
import { decideFulfillment } from "./fulfillment-decision"
import { issueOrderAccessToken } from "@/lib/order-access"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { sendEmailWithRetry } from "@/lib/email/send-with-retry"
import { notifyEvent } from "@/lib/notifications/notify"
import { cache, cacheKeys } from "@/lib/cache"
import { env } from "@/lib/env"

export type FulfillResult =
  | { status: "fulfilled" | "already_fulfilled"; orderId: string }
  | { status: "out_of_stock"; orderId: string }
  | { status: "payment_not_found" }

/**
 * Idempotent order fulfillment. Looks up the payment by Razorpay order id,
 * locks the order row, and — only on the first call for a pending order —
 * marks the payment captured + order completed, decrements stock, issues the
 * email access token, sends the confirmation email, emits notifications, and
 * busts the seller's cached aggregations. A second call (webhook after
 * callback, or a webhook retry) sees `completed` and no-ops.
 */
export async function fulfillOrder(args: {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature?: string | null
  method?: string | null
  bank?: string | null
  wallet?: string | null
  vpa?: string | null
}): Promise<FulfillResult> {
  // Resolve the payment + its order (read-only lookups outside the txn).
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.razorpayOrderId, args.razorpayOrderId))
    .limit(1)

  if (!payment) return { status: "payment_not_found" }

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.paymentId, payment.id))
    .limit(1)

  if (!order) return { status: "payment_not_found" }

  type Outcome =
    | {
        kind: "fulfilled"
        sellerId: string
        buyerId: string | null
        productTitle: string
        orderNumber: string
        totalAmount: string
        buyerEmail: string
        buyerName: string
      }
    | { kind: "already_fulfilled" }
    | { kind: "out_of_stock" }

  const outcome: Outcome = await db.transaction(async (tx) => {
    // Re-read the order under a row lock so two concurrent fulfillments
    // serialize and only one sees `pending`.
    const [locked] = await tx
      .select()
      .from(orders)
      .where(eq(orders.id, order.id))
      .for("update")
      .limit(1)

    const [item] = await tx
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))
      .limit(1)

    const [product] = await tx
      .select({ id: products.id, stock: products.stock })
      .from(products)
      .where(eq(products.id, item.productId))
      .for("update")
      .limit(1)

    const action = decideFulfillment({
      orderStatus: locked.status as "pending" | "completed",
      stock: product?.stock ?? null,
    })

    if (action === "already_fulfilled") return { kind: "already_fulfilled" }
    if (action === "out_of_stock") return { kind: "out_of_stock" }

    // First successful fulfillment: capture payment, complete order,
    // decrement stock — all atomically.
    await tx
      .update(payments)
      .set({
        status: "captured",
        razorpayPaymentId: args.razorpayPaymentId,
        razorpaySignature: args.razorpaySignature ?? null,
        method: args.method ?? null,
        bank: args.bank ?? null,
        wallet: args.wallet ?? null,
        vpa: args.vpa ?? null,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id))

    await tx
      .update(orders)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(orders.id, order.id))

    if (product && product.stock !== null) {
      await tx
        .update(products)
        .set({ stock: sql`${products.stock} - 1` })
        .where(eq(products.id, product.id))
    }

    return {
      kind: "fulfilled",
      sellerId: locked.sellerId,
      buyerId: locked.buyerId,
      productTitle: item.productTitle,
      orderNumber: locked.orderNumber,
      totalAmount: locked.totalAmount,
      buyerEmail: locked.buyerEmail,
      buyerName: locked.buyerName,
    }
  })

  if (outcome.kind === "already_fulfilled") return { status: "already_fulfilled", orderId: order.id }

  if (outcome.kind === "out_of_stock") {
    // Money was authorized but we cannot deliver (a concurrent buyer took the
    // last unit). We do NOT auto-refund (out of scope); flag for manual
    // resolution: leave the order pending, log loudly, and notify the seller.
    console.error(
      `[fulfill-order] OUT OF STOCK after payment — manual refund needed. order=${order.id} payment=${payment.id} rzpOrder=${args.razorpayOrderId} rzpPayment=${args.razorpayPaymentId}`,
    )
    try {
      await notifyEvent({
        userId: order.sellerId,
        type: "system",
        title: "Action needed: paid order is out of stock",
        message: `Order #${order.orderNumber} was paid but the product is out of stock. A manual refund is required.`,
        link: `/dashboard/sales/${order.id}`,
        metadata: { orderId: order.id, paymentId: payment.id, refundNeeded: true },
      })
    } catch (err) {
      console.error("[fulfill-order] out_of_stock seller notify failed:", err)
    }
    return { status: "out_of_stock", orderId: order.id }
  }

  // ── First-fulfillment side-effects (run once) ─────────────────────────────
  // Preserve the original create-order behavior: a newly auto-created buyer
  // (no password set yet, with a live reset token) gets a password-setup link
  // in their confirmation email so they can claim the account.
  let passwordSetupUrl: string | undefined
  if (outcome.buyerId) {
    const [buyer] = await db
      .select({
        passwordHash: users.passwordHash,
        resetToken: users.passwordResetToken,
        resetExpiresAt: users.passwordResetExpiresAt,
      })
      .from(users)
      .where(eq(users.id, outcome.buyerId))
      .limit(1)
    if (
      buyer &&
      !buyer.passwordHash &&
      buyer.resetToken &&
      buyer.resetExpiresAt &&
      buyer.resetExpiresAt.getTime() > Date.now()
    ) {
      passwordSetupUrl = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${buyer.resetToken}`
    }
  }

  // Mint the 24h email access token now that the fulfillment txn has committed.
  const { token: emailToken } = await issueOrderAccessToken(order.id, "email")
  const accessUrl = `${env.NEXT_PUBLIC_APP_URL}/order/${order.id}?t=${emailToken}`

  after(() =>
    sendEmailWithRetry(
      () =>
        sendOrderConfirmationEmail({
          buyerEmail: outcome.buyerEmail,
          buyerName: outcome.buyerName,
          productTitle: outcome.productTitle,
          orderNumber: outcome.orderNumber,
          accessUrl,
          passwordSetupUrl,
        }),
      { label: "order-confirmation", to: outcome.buyerEmail },
    ).catch(() => {
      /* terminal failure already logged inside helper */
    }),
  )

  cache.delete(cacheKeys.salesStats(outcome.sellerId))
  cache.delete(cacheKeys.recentOrders(outcome.sellerId))

  try {
    await notifyEvent({
      userId: outcome.sellerId,
      type: "order_placed",
      title: "New order received",
      message: `Order #${outcome.orderNumber} for ${outcome.productTitle}`,
      link: `/dashboard/sales/${order.id}`,
      metadata: { orderId: order.id, amount: outcome.totalAmount },
    })
  } catch (err) {
    console.error("[notifications] order_placed emit failed:", err)
  }

  if (outcome.buyerId) {
    try {
      await notifyEvent({
        userId: outcome.buyerId,
        type: "order_completed",
        title: "Your purchase is ready",
        message: `${outcome.productTitle} — order #${outcome.orderNumber}`,
        link: `/order/${order.id}`,
        suppress: { email: true },
        metadata: { orderId: order.id },
      })
    } catch (err) {
      console.error("[notifications] order_completed emit failed:", err)
    }
  }

  return { status: "fulfilled", orderId: order.id }
}
