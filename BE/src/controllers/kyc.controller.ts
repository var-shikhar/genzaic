/**
 * KYC Controller
 * HTTP handlers for KYC verification endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { KycService } from '@/services/kyc.service';
import { SubmitKycDto, UpdateKycStatusDto } from '@/validators/kyc.validators';

export class KycController {
  /**
   * Get user's KYC data
   * GET /api/kyc
   */
  static async getKyc(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await KycService.getKyc(userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit KYC information
   * POST /api/kyc
   */
  static async submitKyc(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const kycData: SubmitKycDto = req.body;

      const result = await KycService.submitKyc(userId, kycData);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update KYC status (admin only)
   * PUT /api/kyc/:kycId/status
   */
  static async updateKycStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { kycId } = req.params;
      const statusData: UpdateKycStatusDto = req.body;

      const result = await KycService.updateKycStatus(kycId, statusData);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user's KYC data
   * DELETE /api/kyc
   */
  static async deleteKyc(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const isAdmin = req.user!.role === 'admin';

      const result = await KycService.deleteKyc(userId, isAdmin);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all KYC submissions (admin only)
   * GET /api/kyc/all
   */
  static async getAllKyc(req: Request, res: Response, next: NextFunction) {
    try {
      const { verificationStatus, skip, take } = req.query;

      const filters = {
        verificationStatus: verificationStatus as 'pending' | 'verified' | 'rejected' | undefined,
        skip: skip ? parseInt(skip as string) : undefined,
        take: take ? parseInt(take as string) : undefined,
      };

      const result = await KycService.getAllKyc(filters);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default KycController;
