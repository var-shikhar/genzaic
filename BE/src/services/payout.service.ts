/**
 * Payout Service
 * Business logic for payout operations
 */

import { prisma } from '@/config/database';
import { NotFoundError } from '@/utils/errors';

export class PayoutService {
  /**
   * Get all payouts for a user
   */
  static async getUserPayouts(userId: string, options?: {
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    skip?: number;
    take?: number;
  }) {
    const where: any = { userId };

    if (options?.status) {
      where.status = options.status;
    }

    const [payouts, total] = await Promise.all([
      prisma.payout.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: options?.skip || 0,
        take: options?.take || 50,
      }),
      prisma.payout.count({ where }),
    ]);

    return {
      payouts,
      total,
      message: 'Payouts retrieved successfully',
    };
  }

  /**
   * Get payout statistics for a user
   */
  static async getPayoutStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalRevenue: true,
        kycStatus: true,
        kyc: {
          select: {
            accountHolderName: true,
            bankName: true,
            accountNumber: true,
            ifscCode: true,
            verificationStatus: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Calculate total completed payouts
    const completedPayouts = await prisma.payout.aggregate({
      where: {
        userId,
        status: 'completed',
      },
      _sum: {
        amount: true,
      },
    });

    // Calculate pending payouts
    const pendingPayouts = await prisma.payout.aggregate({
      where: {
        userId,
        status: { in: ['pending', 'processing'] },
      },
      _sum: {
        amount: true,
      },
    });

    // Mask account number (show only last 4 digits)
    const maskedAccountNumber = user.kyc?.accountNumber
      ? `XXXX XXXX ${user.kyc.accountNumber.slice(-4)}`
      : null;

    return {
      stats: {
        totalEarnings: user.totalRevenue,
        completedPayouts: completedPayouts._sum.amount || 0,
        pendingPayouts: pendingPayouts._sum.amount || 0,
        kycStatus: user.kycStatus,
        kycVerified: user.kyc?.verificationStatus === 'verified',
        bankAccount: user.kyc ? {
          accountHolderName: user.kyc.accountHolderName,
          bankName: user.kyc.bankName,
          accountNumber: maskedAccountNumber,
          ifscCode: user.kyc.ifscCode,
        } : null,
      },
      message: 'Payout statistics retrieved successfully',
    };
  }

  /**
   * Get a single payout by ID
   */
  static async getPayoutById(payoutId: string, userId: string) {
    const payout = await prisma.payout.findFirst({
      where: {
        id: payoutId,
        userId, // Ensure user can only access their own payouts
      },
    });

    if (!payout) {
      throw new NotFoundError('Payout not found');
    }

    return {
      payout,
      message: 'Payout retrieved successfully',
    };
  }
}
