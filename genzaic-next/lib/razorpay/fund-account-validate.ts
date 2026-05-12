import "server-only"
import { env } from "@/lib/env"

// Razorpay's Fund Account Validation API.
// https://razorpay.com/docs/api/x/fund-account-validations/
//
// One endpoint, two account types:
//   - bank_account: penny-drop or penny-less validation of (account, IFSC, name)
//   - vpa:          validates a UPI handle and returns the registered name
//
// We hit it synchronously for both bank and VPA at submit time. Razorpay
// usually responds in <2s; a slower in_progress response is mapped to
// `pending` so the admin can resolve manually.

const ENDPOINT = "https://api.razorpay.com/v1/fund_accounts/validations"

export type ValidationResult =
  | { status: "success"; registeredName: string | null; rawId: string }
  | { status: "failed"; reason: string }
  | { status: "pending"; rawId: string }
  | { status: "error"; reason: string }

interface RazorpayValidationResponse {
  id?: string
  status?: "active" | "in_progress" | "failed" | "completed"
  results?: {
    account_status?: string | null
    registered_name?: string | null
  } | null
  error?: { description?: string; reason?: string }
}

function authHeader(): string {
  return (
    "Basic " +
    Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString(
      "base64",
    )
  )
}

async function callRazorpay(body: Record<string, unknown>): Promise<ValidationResult> {
  const auth = authHeader()

  let res: Response
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
  } catch (err) {
    const reason = err instanceof Error ? err.message : "Network error"
    console.error("[razorpay] network error:", reason)
    return { status: "error", reason }
  }

  let data: RazorpayValidationResponse
  try {
    data = (await res.json()) as RazorpayValidationResponse
  } catch {
    return { status: "error", reason: `Razorpay returned non-JSON (HTTP ${res.status})` }
  }

  if (!res.ok) {
    const reason = data.error?.description || data.error?.reason || `HTTP ${res.status}`
    return { status: "failed", reason }
  }

  // Razorpay's response status drives ours.
  switch (data.status) {
    case "active":
    case "completed":
      return {
        status: "success",
        registeredName: data.results?.registered_name ?? null,
        rawId: data.id ?? "",
      }
    case "failed":
      return {
        status: "failed",
        reason: data.results?.account_status || "Validation failed",
      }
    case "in_progress":
      return { status: "pending", rawId: data.id ?? "" }
    default:
      return { status: "error", reason: `Unknown Razorpay status: ${data.status ?? "missing"}` }
  }
}

export async function validateBankAccount(args: {
  accountNumber: string
  ifsc: string
  name: string
}): Promise<ValidationResult> {
  return callRazorpay({
    account: {
      account_type: "bank_account",
      bank_account: {
        name: args.name,
        ifsc: args.ifsc,
        account_number: args.accountNumber,
      },
    },
  })
}

export async function validateVpa(args: {
  vpa: string
  name: string
}): Promise<ValidationResult> {
  return callRazorpay({
    account: {
      account_type: "vpa",
      vpa: { address: args.vpa },
    },
    // Razorpay's VPA validation returns the registered name; we also send the
    // user-entered name so they can correlate it on their dashboard.
    notes: { user_entered_name: args.name.slice(0, 256) },
  })
}
