import { z } from "zod"

export const productVariantSchema = z.object({
  name: z
    .string()
    .min(1, "Variant name is required")
    .max(255, "Name cannot exceed 255 characters"),
  description: z.string().max(2000).optional().nullable(),
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
  originalPrice: z.coerce.number().min(0).optional().nullable(),
  externalUrl: z.string().url("Must be a valid URL").optional().nullable(),
  stock: z.coerce.number().int().min(0).optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
})

export const createVariantsSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  variants: z
    .array(productVariantSchema)
    .min(1, "At least one variant is required")
    .max(20, "Cannot exceed 20 variants per product"),
})

export const updateVariantSchema = productVariantSchema.partial().extend({
  id: z.string().uuid("Invalid variant ID"),
})

export type ProductVariantInput = z.infer<typeof productVariantSchema>
export type CreateVariantsInput = z.infer<typeof createVariantsSchema>
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>
