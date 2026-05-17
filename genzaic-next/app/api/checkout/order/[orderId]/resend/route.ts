import { NextRequest, NextResponse, after } from "next/server"
import { eq } from "drizzle-orm"
import { db, orders, orderItems } from "@/lib/db"
import { issueOrderAccessToken } from "@/lib/order-access"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { sendEmailWithRetry } from "@/lib/email/send-with-retry"
import { enforceRateLimit } from "@/lib/rate-limit"
import { env } from "@/lib/env"

type RouteContext = { params: Promise<{ orderId: string }> }

// POST /api/checkout/order/[orderId]/resend
//
// Re-sends the order-confirmation email with a fresh 24-hour access token.
// Public endpoint — the orderId is the only thing the caller needs to know,
// because the email always goes to the email-of-record stored on the
// order. So even if someone guesses an orderId they can't redirect the
// email to themselves; it always lands in the legitimate buyer's inbox.
//
// Rate-limited aggressively to prevent abuse as an email-spam vector.
export async function POST(req: NextRequest, { params }: RouteContext) {
  const limited = await enforceRateLimit(req, "order-resend", {
    max: 3,
    windowSec: 600,
  })
  if (limited) return limited

  try {
    const { orderId } = await params

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)

    if (!order) {
      // Don't leak whether the order exists — silently succeed.
      return NextResponse.json({ ok: true })
    }

    const [item] = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))
      .limit(1)

    if (!item) {
      return NextResponse.json({ ok: true })
    }

    const { token } = await issueOrderAccessToken(order.id, "email")
    const accessUrl = `${env.NEXT_PUBLIC_APP_URL}/order/${order.id}?t=${token}`

    after(() =>
      sendEmailWithRetry(
        () =>
          sendOrderConfirmationEmail({
            buyerEmail: order.buyerEmail,
            buyerName: order.buyerName,
            productTitle: item.productTitle,
            orderNumber: order.orderNumber,
            accessUrl,
            // No password-setup link on resend — that's a one-time thing
            // from the original create-order. If the buyer wants to claim
            // their account they go through forgot-password instead.
          }),
        { label: "order-resend", to: order.buyerEmail },
      ).catch(() => {}),
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("POST /api/checkout/order/[orderId]/resend error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
