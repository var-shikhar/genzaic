import { z } from "zod"

export const kycSchema = z
  .object({
    documentType: z.enum(["pan", "aadhaar"]),
    panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number").optional().nullable(),
    aadhaarNumber: z
      .string()
      .regex(/^[2-9]{1}[0-9]{11}$/, "Invalid Aadhaar number")
      .optional()
      .nullable(),
    accountHolderName: z.string().min(2, "Name must be at least 2 characters").max(255),
    accountNumber: z.string().min(9, "Account number too short").max(18, "Account number too long"),
    confirmAccountNumber: z.string(),
    ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
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
    if (data.documentType === "pan" && !data.panNumber) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "PAN number is required", path: ["panNumber"] })
    }
    if (data.documentType === "aadhaar" && !data.aadhaarNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Aadhaar number is required",
        path: ["aadhaarNumber"],
      })
    }
  })

export type KycInput = z.infer<typeof kycSchema>
