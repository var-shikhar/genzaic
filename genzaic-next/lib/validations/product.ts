import { z } from "zod"
import { VALIDATION } from "@/lib/brand/voice"

// Empty strings from form inputs should be treated as "not provided" so
// `.email()` / `.url()` don't fire false-positive errors on optional fields.
const emptyToUndef = (v: unknown) => (v === "" || v === null ? undefined : v)

const productBaseSchema = z.object({
    title: z.string().min(3, VALIDATION.titleTooShort).max(500),
    description: z.preprocess(emptyToUndef, z.string().max(5000).optional()),
    // DB column is decimal(10, 2) → cap at 99,999,999.99 so Postgres doesn't
    // 500 on overflow. Anyone needing higher should bump the column first.
    price: z.coerce.number({ message: VALIDATION.priceRequired }).min(0, VALIDATION.pricePositive).max(99_999_999.99, "— Price can't exceed ₹9,99,99,999.99."),
    originalPrice: z.preprocess(emptyToUndef, z.coerce.number().min(0).max(99_999_999.99, "— Was price can't exceed ₹9,99,99,999.99.").optional()),
    categoryId: z.preprocess(emptyToUndef, z.string().uuid("Invalid category ID").optional()),
    deliveryType: z.enum(["download", "external_link", "manual"]),
    externalUrl: z.preprocess(emptyToUndef, z.string().url(VALIDATION.externalUrlInvalid).optional()),
    sellerContactEmail: z.preprocess(emptyToUndef, z.string().email("— That email doesn't look right.").optional()),
    sellerContactPhone: z.preprocess(emptyToUndef, z.string().max(20).optional()),
    sellerContactWhatsapp: z.preprocess(emptyToUndef, z.string().max(20).optional()),
    subscriptionDuration: z
      .enum(["1 month", "3 months", "6 months", "1 year", "lifetime"])
      .optional()
      .nullable(),
    seoTitle: z.string().max(255).optional().nullable(),
    seoKeywords: z.string().max(1000).optional().nullable(),
    stock: z.coerce.number().int().min(0).optional().nullable(),
    isActive: z.boolean().default(true),
    tagIds: z.array(z.string().uuid("Invalid tag ID")).optional().default([]),
    tagNames: z.array(z.string().min(1).max(50)).optional().default([]),
  })

export const productSchema = productBaseSchema
  .superRefine((data, ctx) => {
    // "Was" only makes sense as a strike-through if it's HIGHER than the
    // live price. Runs for drafts too — the constraint is logical, not
    // publish-gated, so creators don't save broken numbers and forget.
    if (data.originalPrice != null && data.originalPrice <= data.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION.originalPriceTooLow,
        path: ["originalPrice"],
      })
    }

    // Skip delivery-specific field checks for drafts. They run only when the
    // creator publishes (isActive === true) — quick-add creates inactive
    // products that the seller fills in on the edit page before going live.
    if (!data.isActive) return
    if (data.deliveryType === "external_link" && !data.externalUrl) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: VALIDATION.externalUrlRequired, path: ["externalUrl"] })
    }
    if (data.deliveryType === "manual") {
      const hasContact = data.sellerContactEmail || data.sellerContactPhone || data.sellerContactWhatsapp
      if (!hasContact) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: VALIDATION.contactRequiredManual,
          path: ["sellerContactEmail"],
        })
      }
    }
  })

export const updateProductSchema = productBaseSchema.partial().extend({
  title: z.string().min(3).max(500).optional(),
  price: z.coerce.number().min(0).optional(),
  deliveryType: z.enum(["download", "external_link", "manual"]).optional(),
})

export type ProductInput = z.infer<typeof productSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
