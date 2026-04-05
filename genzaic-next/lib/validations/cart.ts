import { z } from "zod"

export const addToCartSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  variantId: z.string().uuid("Invalid variant ID").optional().nullable(),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").default(1),
})

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
})

export const removeCartItemSchema = z.object({
  cartItemId: z.string().uuid("Invalid cart item ID"),
})

export type AddToCartInput = z.infer<typeof addToCartSchema>
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>
export type RemoveCartItemInput = z.infer<typeof removeCartItemSchema>
