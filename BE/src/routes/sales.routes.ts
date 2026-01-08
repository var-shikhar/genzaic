import { Router } from 'express';
import { SalesController } from '../controllers/sales.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Sales statistics
router.get('/stats', SalesController.getSalesStats);

// Orders
router.get('/orders/recent', SalesController.getRecentOrders);
router.get('/orders/:orderId', SalesController.getOrderById);
router.get('/orders', SalesController.getOrders);

// Download logs
router.get('/downloads', SalesController.getDownloadLogs);

export default router;
