/**
 * Payout Routes
 * API endpoints for payout operations
 */

import { Router } from 'express';
import { PayoutController } from '@/controllers/payout.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get payout statistics
router.get('/stats', PayoutController.getPayoutStats);

// Get all payouts for user
router.get('/', PayoutController.getUserPayouts);

// Get single payout by ID
router.get('/:payoutId', PayoutController.getPayoutById);

export default router;
