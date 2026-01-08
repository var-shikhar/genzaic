/**
 * User Validators
 * Zod schemas for user profile operations
 */

import { z } from 'zod';

/**
 * Schema for updating user profile
 */
export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255).optional(),
  storeUrl: z
    .string()
    .min(3, 'Store URL must be at least 3 characters')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Store URL can only contain lowercase letters, numbers, and hyphens')
    .optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional().nullable(),
});

/**
 * Schema for updating password
 */
export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

// Export TypeScript types
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordDto = z.infer<typeof updatePasswordSchema>;
