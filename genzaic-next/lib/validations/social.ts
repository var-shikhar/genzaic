import { z } from "zod"

// ─── Follow ───────────────────────────────────────────────────────────────────
export const followSchema = z.object({
  targetUserId: z.string().uuid("Invalid user ID"),
})

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export const wishlistSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
})

// ─── Product Image ────────────────────────────────────────────────────────────
export const productImageSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  altText: z.string().max(255).optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).default(0),
})

export const reorderImagesSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  imageIds: z
    .array(z.string().uuid("Invalid image ID"))
    .min(1, "At least one image is required"),
})

// ─── Tag ──────────────────────────────────────────────────────────────────────
export const createTagSchema = z.object({
  name: z
    .string()
    .min(1, "Tag name is required")
    .max(50, "Tag name cannot exceed 50 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50, "Slug cannot exceed 50 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens only"),
})

export const assignTagsSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  tagIds: z.array(z.string().uuid("Invalid tag ID")),
})

export type FollowInput = z.infer<typeof followSchema>
export type WishlistInput = z.infer<typeof wishlistSchema>
export type ProductImageInput = z.infer<typeof productImageSchema>
export type ReorderImagesInput = z.infer<typeof reorderImagesSchema>
export type CreateTagInput = z.infer<typeof createTagSchema>
export type AssignTagsInput = z.infer<typeof assignTagsSchema>
