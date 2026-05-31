import { z } from "zod"

export const imprintCoverPresetSchema = z.enum([
  "ink",
  "sunlit",
  "stamp",
  "studio",
  "archive",
  "riso",
  "mono",
  "sage",
  "linen",
  "noir",
])
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
  // Permissive regex: allows legacy hyphens/digits AND new underscores. The
  // editor enforces stricter "lowercase + underscore only" rules for fresh
  // input via client-side sanitization + a live availability check; this
  // server-side validator stays permissive so legacy rows continue to save.
  imprintSlug: z
    .string()
    .min(2, "Must be at least 2 characters")
    .max(64)
    .regex(/^[a-z0-9][a-z0-9_-]*$/, "Lowercase letters and underscores only")
    .optional(),
  imprintName: z.string().max(255).optional().nullable(),
  imprintTagline: z.string().max(80).optional().nullable(),
  imprintEditorsNote: z.string().max(140).optional().nullable(),
  imprintCoverPreset: imprintCoverPresetSchema.optional(),
  imprintTypePairing: imprintTypePairingSchema.optional(),
  imprintAccent: imprintAccentSchema.optional(),

  // Showcase (nullable so clients can clear it by sending null)
  showcase: z.lazy(() => showcaseSchema).nullable().optional(),
})

// ─── Showcase ────────────────────────────────────────────────────────────────

export const showcasePlatformSchema = z.enum(["youtube", "instagram"])
export const showcaseKindSchema = z.enum([
  "video",
  "short",
  "reel",
  "post",
  "tv",
])

export const showcaseItemSchema = z.object({
  url: z.string().url(),
  normalizedUrl: z.string().url(),
  embedUrl: z.string().url(),
  platform: showcasePlatformSchema,
  kind: showcaseKindSchema,
  externalId: z.string().min(1).max(64),
  caption: z.string().max(80).optional(),
})

export const showcaseSchema = z
  .object({
    title: z.string().min(1).max(60).default("Watch & Follow"),
    subtitle: z
      .string()
      .max(140)
      .default("Get to know the studio behind the products"),
    featured: showcaseItemSchema.nullable(),
    items: z.array(showcaseItemSchema).max(4).default([]),
  })
  .refine((s) => s.featured !== null || s.items.length === 0, {
    message: "Featured slot is required when any 'more' items are set",
  })

export type ShowcaseItemInput = z.infer<typeof showcaseItemSchema>
export type ShowcaseInput = z.infer<typeof showcaseSchema>

export const checkSlugSchema = z.object({
  slug: z
    .string()
    .min(3, "Must be at least 3 characters")
    .max(50, "Must be less than 50 characters")
    // Permissive: covers both the strict new format (`[a-z_]`) AND legacy
    // slugs (with digits or hyphens) so the availability endpoint can
    // answer questions about either.
    .regex(/^[a-z0-9_-]+$/, "Only lowercase letters, underscores allowed"),
})

export type StorefrontInput = z.infer<typeof storefrontSchema>
export type CheckSlugInput = z.infer<typeof checkSlugSchema>

// ─── Storefront drafts ───────────────────────────────────────────────────────

const imageRefSchema = z
  .object({
    url: z.string().url(),
    fileId: z.string().min(1),
  })
  .nullable()

export const draftContentSchema = z.object({
  imprintName: z.string().max(255).nullable(),
  imprintSlug: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9][a-z0-9_-]*$/)
    .nullable(),
  imprintTagline: z.string().max(80).nullable(),
  imprintEditorsNote: z.string().max(140).nullable(),
  imprintCoverPreset: imprintCoverPresetSchema,
  imprintTypePairing: imprintTypePairingSchema,
  imprintAccent: imprintAccentSchema,
  primaryColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6})$/)
    .nullable(),
  showcase: showcaseSchema.nullable(),
  profileImage: imageRefSchema,
  coverImage: imageRefSchema,
  socialInstagram: z.string().url().nullable(),
  socialTwitter: z.string().url().nullable(),
  socialYoutube: z.string().url().nullable(),
  socialWebsite: z.string().url().nullable(),
})

export type DraftContent = z.infer<typeof draftContentSchema>

export const draftSaveSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  description: z.string().max(500).nullable().optional(),
  content: draftContentSchema.partial().optional(),
})

export const draftCreateSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(500).nullable().optional(),
  seedFromLive: z.boolean().default(false),
  content: draftContentSchema.partial().optional(),
})

export const closedStateSchema = z.object({
  closedHeadline: z.string().max(120).nullable().optional(),
  closedMessage: z.string().max(2000).nullable().optional(),
  closedShowSocials: z.boolean().optional(),
})

export const publishGateReasonSchema = z.enum([
  "min_products",
  "slug_taken",
  "slug_invalid",
  "showcase_invalid",
  "name_required",
])
export type PublishGateReason = z.infer<typeof publishGateReasonSchema>
