/**
 * Storefront Validators
 * Zod schemas for storefront operations
 */

import { z } from 'zod';

/**
 * Schema for updating storefront details
 */
export const updateStorefrontSchema = z.object({
  // Basic Info
  storeName: z.string().min(2, 'Store name must be at least 2 characters').max(100).optional(),
  description: z.string().max(1000).optional().nullable(),
  tagline: z.string().max(200).optional().nullable(),

  // Customization
  themeId: z.string().max(50).optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional().nullable(),
  fontFamily: z.string().max(100).optional().nullable(),

  // Status
  isPublished: z.boolean().optional(),
  platformFeeMode: z.enum(['seller', 'buyer']).optional(),

  // Payment Info (Bank details are stored in KYC table)
  paymentMethods: z.array(z.string()).optional().nullable(),
  upiId: z.string().max(100).optional().nullable(),

  // Contact & Social
  contactEmail: z.string().email('Invalid email').max(255).optional().nullable(),
  contactPhone: z.string().max(20).optional().nullable(),
  socialInstagram: z.string().max(255).optional().nullable(),
  socialTwitter: z.string().max(255).optional().nullable(),
  socialYoutube: z.string().max(255).optional().nullable(),
  socialWebsite: z.string().max(255).optional().nullable(),

  // SEO
  seoTitle: z.string().max(255).optional().nullable(),
  seoDescription: z.string().max(500).optional().nullable(),
  seoKeywords: z.string().max(500).optional().nullable(),
});

/**
 * Schema for storefront query parameters
 */
export const storefrontQuerySchema = z.object({
  includeProducts: z.string().transform((val) => val === 'true').optional(),
  productsLimit: z.string().transform(Number).pipe(z.number().int().positive().max(50)).optional(),
});

// Export TypeScript types
export type UpdateStorefrontDto = z.infer<typeof updateStorefrontSchema>;
export type StorefrontQueryDto = z.infer<typeof storefrontQuerySchema>;
