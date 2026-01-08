import { Router } from 'express';
import { OnboardingController } from '@/controllers/onboarding.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { uploadProductFiles, uploadStorefrontImages } from '@/middleware/upload.middleware';
import {
  createProductSchema,
  updateStorefrontSchema,
  updatePaymentInfoSchema,
  selectPlanSchema,
} from '@/validators/onboarding.validators';

const router = Router();

// All onboarding routes require authentication
router.use(authenticate);

// Step 1: Create first product (with file uploads)
router.post(
  '/product',
  uploadProductFiles,
  validate(createProductSchema),
  OnboardingController.createFirstProduct
);

// Step 2: Update storefront settings (with optional image uploads)
router.put(
  '/storefront',
  uploadStorefrontImages,
  validate(updateStorefrontSchema),
  OnboardingController.updateStorefrontSettings
);

// Step 3: Update payment information
router.put(
  '/payment',
  validate(updatePaymentInfoSchema),
  OnboardingController.updatePaymentInfo
);

// Step 4: Select plan
router.post(
  '/plan',
  validate(selectPlanSchema),
  OnboardingController.selectPlan
);

// Complete onboarding
router.post('/complete', OnboardingController.completeOnboarding);

// Skip onboarding
router.post('/skip', OnboardingController.skipOnboarding);

// Get onboarding status
router.get('/status', OnboardingController.getOnboardingStatus);

export default router;
