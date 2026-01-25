import type { Request, Response, NextFunction } from 'express';
import { OnboardingService } from '@/services/onboarding.service';

export class OnboardingController {
  /**
   * POST /api/onboarding/product
   * Step 1: Create first product
   */
  static async createFirstProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const productData = req.body;
      const files = req.files as { productFile?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] };

      const result = await OnboardingService.createFirstProduct(
        userId,
        productData,
        {
          productFile: files?.productFile?.[0],
          thumbnail: files?.thumbnail?.[0],
        }
      );

      res.status(201).json({
        success: true,
        data: result.product,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/onboarding/storefront
   * Step 2: Update storefront settings
   */
  static async updateStorefrontSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const settings = req.body;
      const files = req.files as { coverImage?: Express.Multer.File[]; profileImage?: Express.Multer.File[] };

      const result = await OnboardingService.updateStorefrontSettings(
        userId,
        settings,
        {
          coverImage: files?.coverImage?.[0],
          profileImage: files?.profileImage?.[0],
        }
      );

      res.json({
        success: true,
        data: result.storefront,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/onboarding/payment
   * Step 3: Update payment information
   */
  static async updatePaymentInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const paymentInfo = req.body;

      const result = await OnboardingService.updatePaymentInfo(userId, paymentInfo);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/onboarding/plan
   * Step 4: Select plan
   */
  static async selectPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const planData = req.body;

      const result = await OnboardingService.selectPlan(userId, planData);

      res.json({
        success: true,
        data: result.user,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/onboarding/complete
   * Complete onboarding
   */
  static async completeOnboarding(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const result = await OnboardingService.completeOnboarding(userId);
      res.json({
        success: true,
        data: result.user,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/onboarding/skip
   * Skip onboarding
   */
  static async skipOnboarding(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const result = await OnboardingService.skipOnboarding(userId);

      res.json({
        success: true,
        data: result.user,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/onboarding/status
   * Get onboarding status
   */
  static async getOnboardingStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const result = await OnboardingService.getOnboardingStatus(userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
