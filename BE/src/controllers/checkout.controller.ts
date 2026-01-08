import { Request, Response, NextFunction } from 'express';
import { CheckoutService } from '../services/checkout.service';

export class CheckoutController {
  /**
   * Get product details for checkout (public endpoint)
   * GET /api/checkout/product/:productId
   */
  static async getProductForCheckout(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const result = await CheckoutService.getProductForCheckout(productId);

      res.json({
        success: true,
        data: result.product,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create order after payment
   * POST /api/checkout/create-order
   */
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        productId,
        buyerName,
        buyerEmail,
        buyerPhone,
        buyerGstin,
        paymentMethod,
        paymentId,
        sellerId,
      } = req.body;

      const result = await CheckoutService.createOrder(
        {
          productId,
          buyerName,
          buyerEmail,
          buyerPhone,
          buyerGstin,
          paymentMethod,
          paymentId,
        },
        sellerId
      );

      res.json({
        success: true,
        data: result.order,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Record download
   * POST /api/checkout/record-download
   */
  static async recordDownload(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await CheckoutService.recordDownload(orderId, ipAddress, userAgent);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order for download page (public endpoint)
   * GET /api/checkout/order/:orderId
   */
  static async getOrderForDownload(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const result = await CheckoutService.getOrderForDownload(orderId);

      res.json({
        success: true,
        data: result.order,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
