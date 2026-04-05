import { z } from "zod"

export const createReviewSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  orderItemId: z.string().uuid("Invalid order item ID"),
  rating: z.coerce
    .number()
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title cannot exceed 255 characters")
    .optional()
    .nullable(),
  body: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(5000, "Review cannot exceed 5000 characters")
    .optional()
    .nullable(),
})

export const sellerReplySchema = z.object({
  reviewId: z.string().uuid("Invalid review ID"),
  sellerReply: z
    .string()
    .min(3, "Reply must be at least 3 characters")
    .max(2000, "Reply cannot exceed 2000 characters"),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type SellerReplyInput = z.infer<typeof sellerReplySchema>
