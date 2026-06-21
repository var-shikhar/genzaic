import { NextRequest, NextResponse } from "next/server"
import { verifyWebhookSignature } from "@/lib/razorpay/verify"
import { fulfillOrder } from "@/lib/checkout/fulfill-order"
import { markPaymentFailed } from "@/lib/checkout/mark-payment-failed"
import { env } from "@/lib/env"

// Razorpay needs the exact raw bytes to verify the signature — read text(),
// never req.json(), before verification.
export async function POST(req: NextRequest) {
  let rawBody: string
  try {
    rawBody = await req.text()
  } catch {
    return NextResponse.json({ error: "Could not read request body" }, { status: 400 })
  }
  const signature = req.headers.get("x-razorpay-signature") ?? ""

  const valid = verifyWebhookSignature({
    rawBody,
    signature,
    webhookSecret: env.RAZORPAY_WEBHOOK_SECRET,
  })
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  let event: {
    event?: string
    payload?: { payment?: { entity?: Record<string, unknown> } }
  }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ received: true }, { status: 200 })
  }

  if (event.event === "payment.captured") {
    const p = event.payload?.payment?.entity ?? {}
    const razorpayOrderId = typeof p.order_id === "string" ? p.order_id : ""
    const razorpayPaymentId = typeof p.id === "string" ? p.id : ""
    if (razorpayOrderId && razorpayPaymentId) {
      try {
        await fulfillOrder({
          razorpayOrderId,
          razorpayPaymentId,
          method: typeof p.method === "string" ? p.method : null,
          bank: typeof p.bank === "string" ? p.bank : null,
          wallet: typeof p.wallet === "string" ? p.wallet : null,
          vpa: typeof p.vpa === "string" ? p.vpa : null,
        })
      } catch (err) {
        // Log and still 200 — Razorpay retries on non-2xx, but a transient DB
        // error here is better surfaced via logs than an endless retry storm;
        // the next webhook retry (if any) or the callback will reconcile.
        console.error("[webhook] fulfillOrder failed:", err)
      }
    }
  } else if (event.event === "payment.failed") {
    // Record the failure on the payment row for our records. markPaymentFailed
    // never downgrades an already-captured payment (buyer may have retried on
    // the same order), so a late failed event can't clobber a fulfilled order.
    const p = event.payload?.payment?.entity ?? {}
    const razorpayOrderId = typeof p.order_id === "string" ? p.order_id : ""
    if (razorpayOrderId) {
      try {
        await markPaymentFailed({
          razorpayOrderId,
          razorpayPaymentId: typeof p.id === "string" ? p.id : null,
          errorCode: typeof p.error_code === "string" ? p.error_code : null,
          errorDescription:
            typeof p.error_description === "string" ? p.error_description : null,
          method: typeof p.method === "string" ? p.method : null,
          bank: typeof p.bank === "string" ? p.bank : null,
          wallet: typeof p.wallet === "string" ? p.wallet : null,
          vpa: typeof p.vpa === "string" ? p.vpa : null,
        })
      } catch (err) {
        console.error("[webhook] markPaymentFailed failed:", err)
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
