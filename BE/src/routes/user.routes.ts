/**
 * User Routes
 * API endpoints for user profile management
 */

import { Router } from 'express';
import { UserController } from '@/controllers/user.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { updateProfileSchema, updatePasswordSchema } from '@/validators/user.validators';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/profile', UserController.getProfile);
router.put('/profile', validate(updateProfileSchema), UserController.updateProfile);
router.put('/password', validate(updatePasswordSchema), UserController.updatePassword);
router.get('/check-store-url/:storeUrl', UserController.checkStoreUrlAvailability);

export default router;
