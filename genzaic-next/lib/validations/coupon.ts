import { z } from "zod"

export const createCouponSchema = z
  .object({
    code: z
      .string()
      .min(3, "Code must be at least 3 characters")
      .max(50, "Code cannot exceed 50 characters")
      .regex(
        /^[A-Z0-9_-]+$/,
        "Code must be uppercase letters, numbers, hyphens or underscores",
      )
      .transform((v) => v.toUpperCase()),
    description: z.string().max(500).optional().nullable(),
    type: z.enum(["percentage", "fixed_amount"], {
      required_error: "Coupon type is required",
    }),
    value: z.coerce.number().positive("Discount value must be greater than 0"),
    scope: z.enum(["platform", "seller"], {
      required_error: "Coupon scope is required",
    }),
    minOrderAmount: z.coerce.number().min(0).default(0),
    maxDiscountAmount: z.coerce.number().positive().optional().nullable(),
    usageLimit: z.coerce.number().int().positive().optional().nullable(),
    perUserLimit: z.coerce.number().int().min(1).default(1),
    validFrom: z.coerce.date({ required_error: "Start date is required" }),
    validTo: z.coerce.date({ required_error: "End date is required" }),
    isActive: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    // Percentage must be between 0 and 100
    if (data.type === "percentage" && data.value > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Percentage discount cannot exceed 100%",
        path: ["value"],
      })
    }

    // validTo must be after validFrom
    if (data.validTo <= data.validFrom) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be after start date",
        path: ["validTo"],
      })
    }

    // validTo must be in the future
    if (data.validTo <= new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be in the future",
        path: ["validTo"],
      })
    }
  })

export const applyCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required").transform((v) => v.toUpperCase()),
  orderSubtotal: z.coerce.number().positive("Order subtotal must be positive"),
})

export const updateCouponSchema = createCouponSchema
  .partial()
  .omit({ code: true, scope: true })

export type CreateCouponInput = z.infer<typeof createCouponSchema>
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>
