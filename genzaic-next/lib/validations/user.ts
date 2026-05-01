import { z } from "zod"

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255).optional(),
  storeUrl: z
    .string()
    .min(3, "Store URL must be at least 3 characters")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers and hyphens")
    .optional()
    .nullable(),
  defaultProductActive: z
    .union([z.boolean(), z.literal("true"), z.literal("false")])
    .transform((v) => (typeof v === "boolean" ? v : v === "true"))
    .optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
