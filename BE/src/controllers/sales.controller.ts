import { Request, Response, NextFunction } from 'express';
import { SalesService } from '../services/sales.service';

export class SalesController {
  /**
   * Get sales statistics
   * GET /api/sales/stats
   */
  static async getSalesStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await SalesService.getSalesStats(userId);

      res.json({
        success: true,
        data: result.stats,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all orders with filters
   * GET /api/sales/orders
   */
  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { status, search, sortBy, skip, take } = req.query;

      const filters = {
        status: status as 'pending' | 'completed' | 'refunded' | undefined,
        search: search as string | undefined,
        sortBy: sortBy as 'newest' | 'oldest' | 'amount-high' | 'amount-low' | undefined,
        skip: skip ? parseInt(skip as string) : undefined,
        take: take ? parseInt(take as string) : undefined,
      };

      const result = await SalesService.getOrders(userId, filters);

      res.json({
        success: true,
        data: {
          orders: result.orders,
          total: result.total,
        },
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recent orders (last 7 days)
   * GET /api/sales/orders/recent
   */
  static async getRecentOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await SalesService.getRecentOrders(userId);

      res.json({
        success: true,
        data: {
          orders: result.orders,
        },
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get download logs
   * GET /api/sales/downloads
   */
  static async getDownloadLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { skip, take } = req.query;

      const filters = {
        skip: skip ? parseInt(skip as string) : undefined,
        take: take ? parseInt(take as string) : undefined,
      };

      const result = await SalesService.getDownloadLogs(userId, filters);

      res.json({
        success: true,
        data: {
          downloadLogs: result.downloadLogs,
          total: result.total,
        },
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single order by ID
   * GET /api/sales/orders/:orderId
   */
  static async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { orderId } = req.params;

      const result = await SalesService.getOrderById(userId, orderId);

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
