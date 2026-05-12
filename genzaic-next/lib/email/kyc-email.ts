export type KycRazorpayEmailOutcome = "passed" | "rejected" | "skip"

/**
 * Decide which Razorpay-result email (if any) to send after the background
 * verification block finishes.
 *
 *   - "rejected" → at least one Razorpay check returned `failed`, so the
 *     overall verificationStatus was flipped to rejected. Tell the seller
 *     what failed and how to fix.
 *   - "passed"   → both Razorpay checks returned `success`. Status stays
 *     pending pending admin review; reassure the seller and set the
 *     1–2 business day expectation.
 *   - "skip"     → either Razorpay call returned `error`/`pending`. The row
 *     is in a hand-it-to-admin state; sending "passed" or "rejected" would
 *     be misleading. The admin-decision email (separate path) closes the
 *     loop later.
 *
 * Kept in its own module — no `lib/env` import — so it can be unit-tested
 * without bootstrapping the whole env validation chain.
 */
export function deriveKycRazorpayEmailOutcome(input: {
  verificationStatus: "pending" | "verified" | "rejected" | "not_submitted"
  pennyDropStatus: "pending" | "success" | "failed"
  vpaStatus: "pending" | "success" | "failed" | "error"
}): KycRazorpayEmailOutcome {
  if (input.verificationStatus === "rejected") return "rejected"
  if (input.pennyDropStatus === "success" && input.vpaStatus === "success") {
    return "passed"
  }
  return "skip"
}
