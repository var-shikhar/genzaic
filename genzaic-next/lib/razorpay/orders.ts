import "server-only"
import { env } from "@/lib/env"
import { toPaise } from "./verify"

const ENDPOINT = "https://api.razorpay.com/v1/orders"

function authHeader(): string {
  return (
    "Basic " +
    Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64")
  )
}

interface RazorpayOrderResponse {
  id?: string
  amount?: number
  currency?: string
  error?: { description?: string; reason?: string }
}

export type CreateRazorpayOrderResult =
  | { ok: true; id: string; amount: number; currency: string }
  | { ok: false; error: string }

/**
 * Creates a Razorpay order (server-side, authoritative amount). The returned
 * `id` (order_xxx) is handed to the browser checkout modal. Amount is converted
 * to paise here so callers pass plain rupees.
 */
export async function createRazorpayOrder(args: {
  amountRupees: number
  receipt: string
  notes?: Record<string, string>
}): Promise<CreateRazorpayOrderResult> {
  let res: Response
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: toPaise(args.amountRupees),
        currency: "INR",
        receipt: args.receipt,
        notes: args.notes,
      }),
    })
  } catch (err) {
    const error = err instanceof Error ? err.message : "Network error"
    console.error("[razorpay] order create network error:", error)
    return { ok: false, error }
  }

  let data: RazorpayOrderResponse
  try {
    data = (await res.json()) as RazorpayOrderResponse
  } catch {
    return { ok: false, error: `Razorpay returned non-JSON (HTTP ${res.status})` }
  }

  if (!res.ok || !data.id) {
    return { ok: false, error: data.error?.description || data.error?.reason || `HTTP ${res.status}` }
  }
  return { ok: true, id: data.id, amount: data.amount ?? 0, currency: data.currency ?? "INR" }
}
