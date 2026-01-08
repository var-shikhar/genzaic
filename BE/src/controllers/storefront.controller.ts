/**
 * Storefront Controller
 * HTTP handlers for storefront routes
 */

import { Request, Response, NextFunction } from 'express';
import { StorefrontService } from '@/services/storefront.service';
import { StorefrontQueryDto } from '@/validators/storefront.validators';

export class StorefrontController {
  /**
   * Get user's storefront
   * GET /api/storefront
   */
  static async getStorefront(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const query = req.query as unknown as StorefrontQueryDto;

      const result = await StorefrontService.getStorefront(userId, query);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get public storefront by slug
   * GET /api/storefront/public/:slug
   */
  static async getPublicStorefront(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;

      const result = await StorefrontService.getPublicStorefront(slug);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update storefront
   * PUT /api/storefront
   */
  static async updateStorefront(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const storefrontData = req.body;

      // Get uploaded files
      const files = req.files as
        | {
            coverImage?: Express.Multer.File[];
            profileImage?: Express.Multer.File[];
          }
        | undefined;

      const coverImage = files?.coverImage?.[0];
      const profileImage = files?.profileImage?.[0];

      const result = await StorefrontService.updateStorefront(userId, storefrontData, {
        coverImage,
        profileImage,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle publish status
   * PATCH /api/storefront/toggle-publish
   */
  static async togglePublishStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const result = await StorefrontService.togglePublishStatus(userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get storefront stats
   * GET /api/storefront/stats
   */
  static async getStorefrontStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const result = await StorefrontService.getStorefrontStats(userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check slug availability
   * GET /api/storefront/check-slug/:slug
   */
  static async checkSlugAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const userId = req.user?.userId; // Optional: exclude current user's slug

      const result = await StorefrontService.checkSlugAvailability(slug, userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default StorefrontController;
