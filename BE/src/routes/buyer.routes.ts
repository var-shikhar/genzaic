/**
 * Buyer Routes
 * Routes for buyer-related operations (my purchases, etc.)
 */

import { Router } from 'express';
import { BuyerController } from '../controllers/buyer.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All buyer routes require authentication
router.use(authenticate);

// Get all orders for logged-in buyer
router.get('/orders', BuyerController.getOrders);

// Get single order details
router.get('/orders/:orderId', BuyerController.getOrder);

// Link guest orders to user account (called after signup/login)
router.post('/link-orders', BuyerController.linkOrders);

export default router;
