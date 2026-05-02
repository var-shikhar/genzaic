import { z } from "zod"

export const imprintCoverPresetSchema = z.enum(["ink", "sunlit", "stamp", "studio", "archive", "riso"])
export const imprintTypePairingSchema = z.enum(["house", "press", "studio", "plain"])
export const imprintAccentSchema      = z.enum(["iris", "sage", "ink_blue", "plum", "ochre", "slate"])

export const storefrontSchema = z.object({
  storeName: z.string().min(2, "Store name must be at least 2 characters").max(255).optional(),
  description: z.string().max(2000).optional().nullable(),
  tagline: z.string().max(255).optional().nullable(),
  themeId: z.string().max(50).optional(),
  primaryColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color")
    .optional(),
  fontFamily: z.string().max(100).optional(),
  platformFeeMode: z.enum(["seller", "buyer"]).optional(),
  upiId: z.string().max(255).optional().nullable(),
  contactEmail: z.string().email("Invalid email").optional().nullable(),
  contactPhone: z.string().max(50).optional().nullable(),
  contactWhatsapp: z.string().max(50).optional().nullable(),
  socialInstagram: z.string().url("Must be a valid URL").optional().nullable(),
  socialTwitter: z.string().url("Must be a valid URL").optional().nullable(),
  socialYoutube: z.string().url("Must be a valid URL").optional().nullable(),
  socialWebsite: z.string().url("Must be a valid URL").optional().nullable(),
  seoTitle: z.string().max(255).optional().nullable(),
  seoDescription: z.string().max(500).optional().nullable(),
  seoKeywords: z.string().max(1000).optional().nullable(),

  // Imprint (Editorial OS)
  imprintSlug: z
    .string()
    .min(2, "Must be at least 2 characters")
    .max(64)
    .regex(/^[a-z0-9][a-z0-9-]*$/, "Lowercase letters, numbers, hyphens only")
    .optional(),
  imprintName: z.string().max(255).optional().nullable(),
  imprintTagline: z.string().max(80).optional().nullable(),
  imprintEditorsNote: z.string().max(140).optional().nullable(),
  imprintCoverPreset: imprintCoverPresetSchema.optional(),
  imprintTypePairing: imprintTypePairingSchema.optional(),
  imprintAccent: imprintAccentSchema.optional(),
})

export const checkSlugSchema = z.object({
  slug: z
    .string()
    .min(3, "Must be at least 3 characters")
    .max(50, "Must be less than 50 characters")
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers and hyphens allowed"),
})

export type StorefrontInput = z.infer<typeof storefrontSchema>
export type CheckSlugInput = z.infer<typeof checkSlugSchema>
