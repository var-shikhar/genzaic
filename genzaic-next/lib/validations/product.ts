import { z } from "zod"

const productBaseSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(500),
    description: z.string().max(5000).optional(),
    price: z.coerce.number().min(0, "Price must be positive"),
    originalPrice: z.coerce.number().min(0).optional().nullable(),
    categoryId: z.string().uuid("Invalid category ID").optional().nullable(),
    deliveryType: z.enum(["download", "external_link", "manual"]),
    externalUrl: z.string().url("Must be a valid URL").optional().nullable(),
    sellerContactEmail: z.string().email("Invalid email").optional().nullable(),
    sellerContactPhone: z.string().max(20).optional().nullable(),
    sellerContactWhatsapp: z.string().max(20).optional().nullable(),
    subscriptionDuration: z
      .enum(["1 month", "3 months", "6 months", "1 year", "lifetime"])
      .optional()
      .nullable(),
    seoTitle: z.string().max(255).optional().nullable(),
    seoKeywords: z.string().max(1000).optional().nullable(),
    stock: z.coerce.number().int().min(0).optional().nullable(),
    isActive: z.boolean().default(true),
    tagIds: z.array(z.string().uuid("Invalid tag ID")).optional().default([]),
  })

export const productSchema = productBaseSchema
  .superRefine((data, ctx) => {
    if (data.deliveryType === "external_link" && !data.externalUrl) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "External URL is required", path: ["externalUrl"] })
    }
    if (data.deliveryType === "manual") {
      const hasContact = data.sellerContactEmail || data.sellerContactPhone || data.sellerContactWhatsapp
      if (!hasContact) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one contact method is required for manual delivery",
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
