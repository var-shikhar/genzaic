/**
 * KYC Service
 * Business logic for KYC verification operations
 */

import { prisma } from '@/config/database';
import { SubmitKycDto, UpdateKycStatusDto } from '@/validators/kyc.validators';
import { ConflictError, NotFoundError, ValidationError } from '@/utils/errors';

export class KycService {
  /**
   * Get KYC data for a user
   */
  static async getKyc(userId: string) {
    const kyc = await prisma.kyc.findUnique({
      where: { userId },
      select: {
        id: true,
        documentType: true,
        panNumber: true,
        aadhaarNumber: true,
        documentFileUrl: true,
        accountHolderName: true,
        accountNumber: true,
        ifscCode: true,
        bankName: true,
        verificationStatus: true,
        pennyDropStatus: true,
        rejectionReason: true,
        verifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      kyc,
      message: kyc ? 'KYC data retrieved successfully' : 'No KYC data found',
    };
  }

  /**
   * Submit KYC information
   */
  static async submitKyc(userId: string, kycData: SubmitKycDto) {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, kycStatus: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if KYC already exists
    const existingKyc = await prisma.kyc.findUnique({
      where: { userId },
    });

    // If KYC exists and is verified, don't allow resubmission
    if (existingKyc && existingKyc.verificationStatus === 'verified') {
      throw new ConflictError('KYC is already verified. Contact support for changes.');
    }

    // Prepare KYC data
    const kycPayload: any = {
      documentType: kycData.documentType,
      accountHolderName: kycData.accountHolderName,
      accountNumber: kycData.accountNumber,
      ifscCode: kycData.ifscCode,
      bankName: kycData.bankName,
      verificationStatus: 'pending',
      pennyDropStatus: 'pending',
      rejectionReason: null,
    };

    // Add document number based on type
    if (kycData.documentType === 'pan') {
      kycPayload.panNumber = kycData.panNumber;
      kycPayload.aadhaarNumber = null;
    } else {
      kycPayload.aadhaarNumber = kycData.aadhaarNumber?.replace(/\s/g, ''); // Remove spaces
      kycPayload.panNumber = null;
    }

    // Add document file URL if provided
    if (kycData.documentFileUrl) {
      kycPayload.documentFileUrl = kycData.documentFileUrl;
    }

    // Create or update KYC
    const kyc = await prisma.kyc.upsert({
      where: { userId },
      create: {
        userId,
        ...kycPayload,
      },
      update: kycPayload,
    });

    // Update user's KYC status
    await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: 'pending' },
    });

    return {
      kyc,
      message: 'KYC submitted successfully. We will verify your documents within 1-2 business days.',
    };
  }

  /**
   * Update KYC verification status (admin only)
   */
  static async updateKycStatus(kycId: string, statusData: UpdateKycStatusDto) {
    const kyc = await prisma.kyc.findUnique({
      where: { id: kycId },
      include: { user: true },
    });

    if (!kyc) {
      throw new NotFoundError('KYC record not found');
    }

    // Prepare update data
    const updateData: any = {
      verificationStatus: statusData.verificationStatus,
    };

    if (statusData.pennyDropStatus) {
      updateData.pennyDropStatus = statusData.pennyDropStatus;
    }

    if (statusData.rejectionReason) {
      updateData.rejectionReason = statusData.rejectionReason;
    }

    // Set verifiedAt timestamp if status is verified
    if (statusData.verificationStatus === 'verified') {
      updateData.verifiedAt = new Date();
      updateData.rejectionReason = null; // Clear rejection reason
    }

    // Update KYC record
    const updatedKyc = await prisma.kyc.update({
      where: { id: kycId },
      data: updateData,
    });

    // Update user's KYC status
    await prisma.user.update({
      where: { id: kyc.userId },
      data: { kycStatus: statusData.verificationStatus },
    });

    return {
      kyc: updatedKyc,
      message: `KYC status updated to ${statusData.verificationStatus}`,
    };
  }

  /**
   * Delete KYC data (admin only or user if not verified)
   */
  static async deleteKyc(userId: string, isAdmin: boolean = false) {
    const kyc = await prisma.kyc.findUnique({
      where: { userId },
    });

    if (!kyc) {
      throw new NotFoundError('KYC record not found');
    }

    // Only allow deletion if KYC is not verified or if admin
    if (kyc.verificationStatus === 'verified' && !isAdmin) {
      throw new ValidationError('Cannot delete verified KYC. Contact support.');
    }

    await prisma.kyc.delete({
      where: { userId },
    });

    // Update user's KYC status
    await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: 'not_submitted' },
    });

    return {
      message: 'KYC data deleted successfully',
    };
  }

  /**
   * Get all KYC submissions (admin only)
   */
  static async getAllKyc(filters?: {
    verificationStatus?: 'pending' | 'verified' | 'rejected';
    skip?: number;
    take?: number;
  }) {
    const where: any = {};

    if (filters?.verificationStatus) {
      where.verificationStatus = filters.verificationStatus;
    }

    const [kycs, total] = await Promise.all([
      prisma.kyc.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              storeUrl: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: filters?.skip || 0,
        take: filters?.take || 50,
      }),
      prisma.kyc.count({ where }),
    ]);

    return {
      kycs,
      total,
      message: 'KYC submissions retrieved successfully',
    };
  }
}

export default KycService;
