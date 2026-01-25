/**
 * AI Routes
 * Routes for AI-powered features
 */

import { Router } from 'express';
import { AIController } from '@/controllers/ai.controller';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();

/**
 * POST /api/ai/parse-product-text
 * Extract product details from text using AI
 * Requires authentication
 */
router.post('/parse-product-text', authenticate, AIController.parseProductText);

export default router;
