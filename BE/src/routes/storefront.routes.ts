/**
 * Storefront Routes
 * API endpoints for storefront management
 */

import { Router } from 'express';
import { StorefrontController } from '@/controllers/storefront.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { uploadStorefrontImages } from '@/middleware/upload.middleware';
import { updateStorefrontSchema, storefrontQuerySchema } from '@/validators/storefront.validators';

const router = Router();

// Public routes (no authentication required)
router.get('/public/:slug', StorefrontController.getPublicStorefront);

// Protected routes (authentication required)
router.use(authenticate);

router.get('/stats', StorefrontController.getStorefrontStats);
router.get('/check-slug/:slug', StorefrontController.checkSlugAvailability);
router.get('/', validate(storefrontQuerySchema, 'query'), StorefrontController.getStorefront);
router.put(
  '/',
  uploadStorefrontImages,
  validate(updateStorefrontSchema),
  StorefrontController.updateStorefront
);
router.patch('/toggle-publish', StorefrontController.togglePublishStatus);

export default router;
