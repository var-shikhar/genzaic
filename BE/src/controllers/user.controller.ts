/**
 * User Controller
 * HTTP handlers for user profile routes
 */

import { Request, Response, NextFunction } from 'express';
import { UserService } from '@/services/user.service';

export class UserController {
  /**
   * Get current user profile
   * GET /api/user/profile
   */
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const result = await UserService.getProfile(userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   * PUT /api/user/profile
   */
  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const profileData = req.body;

      const result = await UserService.updateProfile(userId, profileData);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user password
   * PUT /api/user/password
   */
  static async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const passwordData = req.body;

      const result = await UserService.updatePassword(userId, passwordData);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check store URL availability
   * GET /api/user/check-store-url/:storeUrl
   */
  static async checkStoreUrlAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { storeUrl } = req.params;
      const userId = req.user?.userId;

      const result = await UserService.checkStoreUrlAvailability(storeUrl, userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
