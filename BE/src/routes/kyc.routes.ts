/**
 * KYC Routes
 * API endpoints for KYC verification
 */

import { Router } from 'express';
import { KycController } from '@/controllers/kyc.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { submitKycSchema, updateKycStatusSchema } from '@/validators/kyc.validators';

const router = Router();

// All routes require authentication
router.use(authenticate);

// User KYC endpoints
router.get('/', KycController.getKyc);
router.post('/', validate(submitKycSchema), KycController.submitKyc);
router.delete('/', KycController.deleteKyc);

// Admin endpoints (add admin middleware later if needed)
router.get('/all', KycController.getAllKyc);
router.put('/:kycId/status', validate(updateKycStatusSchema), KycController.updateKycStatus);

export default router;
