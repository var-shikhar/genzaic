import { z } from 'zod';

/**
 * Create Product Schema
 */
export const createProductSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  description: z.string().max(5000).optional(),
  price: z
    .number()
    .positive('Price must be positive')
    .max(10000000, 'Price too high'),
  seoTitle: z.string().max(255).optional(),
  seoKeywords: z.string().max(500).optional(),
  stock: z.number().int().min(0).optional().nullable(),
  isActive: z.boolean().default(true),
});

/**
 * Update Product Schema
 */
export const updateProductSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255).optional(),
  description: z.string().max(5000).optional(),
  price: z
    .number()
    .positive('Price must be positive')
    .max(10000000, 'Price too high')
    .optional(),
  seoTitle: z.string().max(255).optional(),
  seoKeywords: z.string().max(500).optional(),
  stock: z.number().int().min(0).optional().nullable(),
  isActive: z.boolean().optional(),
});

/**
 * Product Query Schema (for filtering/pagination)
 */
export const productQuerySchema = z.object({
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .default('1'),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive().max(100))
    .default('10'),
  search: z.string().optional(),
  isActive: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  sortBy: z.enum(['createdAt', 'title', 'price', 'views', 'downloads']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Export types
export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
export type ProductQueryDto = z.infer<typeof productQuerySchema>;
