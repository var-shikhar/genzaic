import { describe, it, expect } from "vitest"
import { deriveKycRazorpayEmailOutcome } from "./kyc-email"

describe("deriveKycRazorpayEmailOutcome", () => {
  it("returns 'rejected' when verificationStatus is rejected", () => {
    const outcome = deriveKycRazorpayEmailOutcome({
      verificationStatus: "rejected",
      pennyDropStatus: "failed",
      vpaStatus: "success",
    })
    expect(outcome).toBe("rejected")
  })

  it("returns 'passed' when both Razorpay statuses succeeded", () => {
    const outcome = deriveKycRazorpayEmailOutcome({
      verificationStatus: "pending",
      pennyDropStatus: "success",
      vpaStatus: "success",
    })
    expect(outcome).toBe("passed")
  })

  it("returns 'skip' when penny-drop succeeded but VPA errored", () => {
    const outcome = deriveKycRazorpayEmailOutcome({
      verificationStatus: "pending",
      pennyDropStatus: "success",
      vpaStatus: "error",
    })
    expect(outcome).toBe("skip")
  })

  it("returns 'skip' when penny-drop is still pending", () => {
    const outcome = deriveKycRazorpayEmailOutcome({
      verificationStatus: "pending",
      pennyDropStatus: "pending",
      vpaStatus: "success",
    })
    expect(outcome).toBe("skip")
  })

  it("prefers 'rejected' even if one Razorpay status is success", () => {
    const outcome = deriveKycRazorpayEmailOutcome({
      verificationStatus: "rejected",
      pennyDropStatus: "success",
      vpaStatus: "failed",
    })
    expect(outcome).toBe("rejected")
  })
})
