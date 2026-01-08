/**
 * Buyer Controller
 * Handles buyer-related HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import { BuyerService } from '../services/buyer.service';

export class BuyerController {
  /**
   * Get all orders for logged-in buyer
   * GET /api/buyer/orders
   */
  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const buyerId = req.user!.userId; // User is authenticated via middleware
      const result = await BuyerService.getBuyerOrders(buyerId);

      res.json({
        success: true,
        data: result.orders,
        total: result.total,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single order for logged-in buyer
   * GET /api/buyer/orders/:orderId
   */
  static async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const buyerId = req.user!.userId;
      const { orderId } = req.params;

      const result = await BuyerService.getBuyerOrder(orderId, buyerId);

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
   * Link guest orders to user account
   * POST /api/buyer/link-orders
   * This is called automatically after signup/login
   */
  static async linkOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const userEmail = req.user!.email;

      const result = await BuyerService.linkGuestOrdersToUser(userEmail, userId);

      res.json({
        success: true,
        data: {
          linkedCount: result.linkedCount,
        },
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
