/**
 * KYC Validators
 * Zod schemas for KYC verification operations
 */

import { z } from 'zod';

/**
 * Schema for submitting KYC information
 */
export const submitKycSchema = z.object({
  documentType: z.enum(['pan', 'aadhaar'], {
    required_error: 'Document type is required',
  }),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g., ABCDE1234F)')
    .optional()
    .nullable(),
  aadhaarNumber: z
    .string()
    .regex(/^\d{12}$/, 'Invalid Aadhaar number (must be 12 digits)')
    .optional()
    .nullable(),
  documentFileUrl: z.string().url('Invalid document file URL').optional().nullable(),
  accountHolderName: z
    .string()
    .min(2, 'Account holder name must be at least 2 characters')
    .max(255, 'Account holder name is too long'),
  accountNumber: z
    .string()
    .min(8, 'Account number must be at least 8 digits')
    .max(20, 'Account number is too long')
    .regex(/^\d+$/, 'Account number must contain only digits'),
  ifscCode: z
    .string()
    .length(11, 'IFSC code must be exactly 11 characters')
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),
  bankName: z
    .string()
    .min(2, 'Bank name must be at least 2 characters')
    .max(255, 'Bank name is too long'),
}).refine(
  (data) => {
    // If PAN is selected, panNumber is required
    if (data.documentType === 'pan') {
      return !!data.panNumber;
    }
    // If Aadhaar is selected, aadhaarNumber is required
    if (data.documentType === 'aadhaar') {
      return !!data.aadhaarNumber;
    }
    return true;
  },
  {
    message: 'Document number is required for the selected document type',
    path: ['documentType'],
  }
);

/**
 * Schema for updating KYC status (admin only)
 */
export const updateKycStatusSchema = z.object({
  verificationStatus: z.enum(['pending', 'verified', 'rejected'], {
    required_error: 'Verification status is required',
  }),
  pennyDropStatus: z.enum(['pending', 'success', 'failed']).optional(),
  rejectionReason: z.string().max(1000, 'Rejection reason is too long').optional().nullable(),
});

// Export TypeScript types
export type SubmitKycDto = z.infer<typeof submitKycSchema>;
export type UpdateKycStatusDto = z.infer<typeof updateKycStatusSchema>;
