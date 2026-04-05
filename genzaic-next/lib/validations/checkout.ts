import { z } from "zod"

export const checkoutSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  buyerName: z.string().min(2, "Name must be at least 2 characters").max(255),
  buyerEmail: z.string().email("Invalid email address"),
  buyerPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid Indian phone number")
    .optional()
    .nullable(),
  buyerGstin: z
    .string()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      "Invalid GSTIN"
    )
    .optional()
    .nullable(),
  paymentMethod: z.enum(["upi", "card", "wallet", "netbanking"]).optional(),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
