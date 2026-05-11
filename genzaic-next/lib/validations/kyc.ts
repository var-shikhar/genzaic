import { z } from "zod"

const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/
const AADHAAR_RE = /^[2-9][0-9]{11}$/
// UPI VPA: handle@psp. Razorpay's spec.
const VPA_RE = /^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/

export const kycSchema = z
  .object({
    panNumber: z
      .string()
      .min(1, "PAN number is required")
      .regex(PAN_RE, "Invalid PAN — should look like ABCDE1234F"),
    aadhaarNumber: z
      .string()
      .min(1, "Aadhaar number is required")
      .regex(AADHAAR_RE, "Invalid Aadhaar — must be 12 digits, not starting with 0 or 1"),
    upiId: z
      .string()
      .min(1, "UPI ID is required")
      .regex(VPA_RE, "Invalid UPI — should look like name@bank"),
    accountHolderName: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(255),
    accountNumber: z
      .string()
      .min(9, "Account number too short")
      .max(18, "Account number too long"),
    confirmAccountNumber: z.string(),
    ifscCode: z
      .string()
      .min(1, "IFSC code is required")
      .regex(IFSC_RE, "Invalid IFSC code"),
    bankName: z.string().min(2, "Bank name too short").max(255),
  })
  .superRefine((data, ctx) => {
    if (data.accountNumber !== data.confirmAccountNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Account numbers do not match",
        path: ["confirmAccountNumber"],
      })
    }
  })

export type KycInput = z.infer<typeof kycSchema>

// Field groups used by the multi-step wizard for per-step validation
// (form.trigger(stepFields)).
export const KYC_STEP_FIELDS = {
  identity: ["panNumber", "aadhaarNumber"] as const,
  payment: [
    "upiId",
    "accountHolderName",
    "accountNumber",
    "confirmAccountNumber",
    "ifscCode",
    "bankName",
  ] as const,
} as const

export const KYC_FILE_LIMITS = {
  maxBytes: 5 * 1024 * 1024, // 5 MB
  acceptedMimes: ["image/jpeg", "image/png", "application/pdf"] as const,
}
