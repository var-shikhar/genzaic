import { createHmac, timingSafeEqual } from "crypto"

/** Rupees (may be fractional) → integer paise, as Razorpay's `amount` field expects. */
export function toPaise(rupees: number): number {
  return Math.round(rupees * 100)
}

// Compare two hex digests without leaking timing. Returns false on any length
// mismatch or non-hex input instead of throwing — a malformed signature is just
// an invalid signature.
function safeEqualHex(a: string, b: string): boolean {
  if (!a || !b) return false
  let bufA: Buffer
  let bufB: Buffer
  try {
    bufA = Buffer.from(a, "hex")
    bufB = Buffer.from(b, "hex")
  } catch {
    return false
  }
  if (bufA.length === 0 || bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

/**
 * Razorpay Standard Checkout returns `razorpay_signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret)`.
 * https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/build-integration/#verify-payment-signature
 */
export function verifyCallbackSignature(args: {
  razorpayOrderId: string
  razorpayPaymentId: string
  signature: string
  keySecret: string
}): boolean {
  const expected = createHmac("sha256", args.keySecret)
    .update(`${args.razorpayOrderId}|${args.razorpayPaymentId}`)
    .digest("hex")
  return safeEqualHex(expected, args.signature)
}

/**
 * Webhook signature = HMAC_SHA256(raw_request_body, webhook_secret), sent in the
 * `X-Razorpay-Signature` header. MUST be computed over the exact raw bytes.
 * https://razorpay.com/docs/webhooks/validate-test/
 */
export function verifyWebhookSignature(args: {
  rawBody: string
  signature: string
  webhookSecret: string
}): boolean {
  const expected = createHmac("sha256", args.webhookSecret)
    .update(args.rawBody)
    .digest("hex")
  return safeEqualHex(expected, args.signature)
}
