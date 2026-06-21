import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { verifyCallbackSignature } from "@/lib/razorpay/verify"
import { fulfillOrder } from "@/lib/checkout/fulfill-order"
import { issueOrderAccessToken } from "@/lib/order-access"
import { enforceRateLimit } from "@/lib/rate-limit"
import { env } from "@/lib/env"

const bodySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(req, "checkout", { max: 20, windowSec: 60 })
  if (limited) return limited

  let parsed: z.infer<typeof bodySchema>
  try {
    parsed = bodySchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: "Invalid payment confirmation payload" }, { status: 400 })
  }

  const valid = verifyCallbackSignature({
    razorpayOrderId: parsed.razorpay_order_id,
    razorpayPaymentId: parsed.razorpay_payment_id,
    signature: parsed.razorpay_signature,
    keySecret: env.RAZORPAY_KEY_SECRET,
  })
  if (!valid) {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
  }

  const result = await fulfillOrder({
    razorpayOrderId: parsed.razorpay_order_id,
    razorpayPaymentId: parsed.razorpay_payment_id,
    razorpaySignature: parsed.razorpay_signature,
  })

  if (result.status === "payment_not_found") {
    return NextResponse.json({ error: "Order not found for this payment" }, { status: 404 })
  }
  if (result.status === "out_of_stock") {
    return NextResponse.json(
      { error: "This item sold out before your payment completed. Our team will refund you." },
      { status: 409 },
    )
  }

  // fulfilled or already_fulfilled: hand back a fresh short-lived token so the
  // success page can show the download immediately.
  const { token } = await issueOrderAccessToken(result.orderId, "checkout")
  return NextResponse.json({ orderId: result.orderId, accessToken: token }, { status: 200 })
}
