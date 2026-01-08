import { Router } from 'express';
import { CheckoutController } from '../controllers/checkout.controller';

const router = Router();

// Public routes (no authentication required for checkout)
router.get('/product/:productId', CheckoutController.getProductForCheckout);
router.post('/create-order', CheckoutController.createOrder);
router.post('/record-download', CheckoutController.recordDownload);
router.get('/order/:orderId', CheckoutController.getOrderForDownload);

export default router;
