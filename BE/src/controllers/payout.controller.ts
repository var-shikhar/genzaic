/**
 * Payout Controller
 * HTTP handlers for payout endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { PayoutService } from '@/services/payout.service';

export class PayoutController {
  /**
   * GET /api/payouts
   * Get all payouts for current user
   */
  static async getUserPayouts(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { status, skip, take } = req.query;

      const result = await PayoutService.getUserPayouts(userId, {
        status: status as any,
        skip: skip ? parseInt(skip as string) : undefined,
        take: take ? parseInt(take as string) : undefined,
      });

      res.json({
        success: true,
        data: result.payouts,
        total: result.total,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/payouts/stats
   * Get payout statistics for current user
   */
  static async getPayoutStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await PayoutService.getPayoutStats(userId);

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
   * GET /api/payouts/:payoutId
   * Get a single payout by ID
   */
  static async getPayoutById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { payoutId } = req.params;

      const result = await PayoutService.getPayoutById(payoutId, userId);

      res.json({
        success: true,
        data: result.payout,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
