import { z } from "zod"

// Step 1: Product Upload
export const createProductSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  description: z.string().max(8081).optional(),
  price: z.number(),
  seoTitle: z.string().max(255).optional(),
  seoKeywords: z.string().max(500).optional(),
  // Files are handled via multer middleware, not in body validation
})

// Step 2: Storefront Settings
export const updateStorefrontSchema = z.object({
  storeName: z
    .string()
    .min(2, "Store name must be at least 2 characters")
    .max(255)
    .optional(),
  storeDescription: z.string().max(1000).optional(),
  tagline: z.string().max(255).optional(),
  themeId: z
    .enum([
      "minimal",
      "modern",
      "creative",
      "professional",
      "elegant",
      "nature",
      "sunset",
      "ocean",
      "midnight",
      "candy",
    ])
    .optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .optional(),
  fontFamily: z
    .enum([
      "dm-sans",
      "montserrat",
      "nunito",
      "open-sans",
      "outfit",
      "quicksand",
      "raleway",
      "source-sans",
      "space-grotesk",
      "lora",
    ])
    .optional(),
  isPublished: z.boolean().optional(),
})

// Step 3: Payment Information
// Note: Bank account details are now stored in KYC table
export const updatePaymentInfoSchema = z
  .object({
    paymentMethod: z.enum(["bank", "upi"]),
    // Bank details (stored in KYC table)
    documentType: z.enum(["pan", "aadhaar"]).optional(),
    panNumber: z
      .string()
      .regex(
        /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
        "Invalid PAN format (e.g., ABCDE1234F)"
      )
      .optional(),
    aadhaarNumber: z
      .string()
      .regex(/^\d{12}$/, "Invalid Aadhaar number (must be 12 digits)")
      .optional(),
    accountHolderName: z.string().min(2).max(255).optional(),
    accountNumber: z
      .string()
      .min(8, "Account number must be at least 8 digits")
      .max(20, "Account number is too long")
      .regex(/^\d+$/, "Account number must contain only digits")
      .optional(),
    ifscCode: z
      .string()
      .length(11, "IFSC code must be exactly 11 characters")
      .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format")
      .optional(),
    bankName: z.string().min(2).max(255).optional(),
    // UPI details (stored in storefront)
    upiId: z
      .string()
      .regex(/^[\w.-]+@[\w.-]+$/, "Invalid UPI ID")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.paymentMethod === "bank") {
        // For bank payment, require document type and corresponding document number
        if (!data.documentType) return false
        if (data.documentType === "pan" && !data.panNumber) return false
        if (data.documentType === "aadhaar" && !data.aadhaarNumber) return false
        // Require bank account details
        return (
          !!data.accountHolderName &&
          !!data.accountNumber &&
          !!data.ifscCode &&
          !!data.bankName
        )
      }
      if (data.paymentMethod === "upi") {
        return !!data.upiId
      }
      return false
    },
    {
      message: "Payment details are required based on selected payment method",
    }
  )

// Step 4: Plan Selection
export const selectPlanSchema = z.object({
  planType: z.enum(["creator", "startup"]),
})

// Complete Onboarding
export const completeOnboardingSchema = z.object({
  onboardingComplete: z.boolean(),
})

export type CreateProductDto = z.infer<typeof createProductSchema>
export type UpdateStorefrontDto = z.infer<typeof updateStorefrontSchema>
export type UpdatePaymentInfoDto = z.infer<typeof updatePaymentInfoSchema>
export type SelectPlanDto = z.infer<typeof selectPlanSchema>
export type CompleteOnboardingDto = z.infer<typeof completeOnboardingSchema>
