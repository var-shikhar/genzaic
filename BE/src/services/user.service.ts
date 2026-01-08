/**
 * User Service
 * Business logic for user profile operations
 */

import { prisma } from '@/config/database';
import { UpdateProfileDto, UpdatePasswordDto } from '@/validators/user.validators';
import { ConflictError, UnauthorizedError, NotFoundError } from '@/utils/errors';
import bcrypt from 'bcryptjs';

export class UserService {
  /**
   * Get user profile
   */
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        isSeller: true,
        storeUrl: true,
        planType: true,
        kycStatus: true,
        onboardingComplete: true,
        emailVerified: true,
        followersCount: true,
        totalProducts: true,
        totalSales: true,
        totalRevenue: true,
        createdAt: true,
        updatedAt: true,
        storefront: {
          select: {
            id: true,
            storeName: true,
            platformFeeMode: true,
            isPublished: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      user,
      message: 'User profile retrieved successfully',
    };
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, profileData: UpdateProfileDto) {
    // Check if storeUrl is being updated and if it's already taken
    if (profileData.storeUrl) {
      const existingUser = await prisma.user.findFirst({
        where: {
          storeUrl: profileData.storeUrl,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        throw new ConflictError('Store URL is already taken');
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(profileData.name && { name: profileData.name }),
        ...(profileData.storeUrl && { storeUrl: profileData.storeUrl }),
        ...(profileData.avatarUrl !== undefined && { avatarUrl: profileData.avatarUrl }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        isSeller: true,
        storeUrl: true,
        planType: true,
        kycStatus: true,
        onboardingComplete: true,
        emailVerified: true,
        followersCount: true,
        totalProducts: true,
        totalSales: true,
        totalRevenue: true,
        createdAt: true,
        updatedAt: true,
        storefront: {
          select: {
            id: true,
            storeName: true,
            platformFeeMode: true,
            isPublished: true,
          },
        },
      },
    });

    // Update storefront storeUrl if it exists
    if (profileData.storeUrl && user.storefront) {
      await prisma.storefront.update({
        where: { userId },
        data: { storeUrl: profileData.storeUrl },
      });
    }

    return {
      user,
      message: 'Profile updated successfully',
    };
  }

  /**
   * Update user password
   */
  static async updatePassword(userId: string, passwordData: UpdatePasswordDto) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(passwordData.currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(passwordData.newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    return {
      message: 'Password updated successfully',
    };
  }

  /**
   * Check store URL availability
   */
  static async checkStoreUrlAvailability(storeUrl: string, excludeUserId?: string) {
    const existingUser = await prisma.user.findFirst({
      where: {
        storeUrl,
        ...(excludeUserId && { NOT: { id: excludeUserId } }),
      },
    });

    return {
      available: !existingUser,
      message: existingUser ? 'Store URL is already taken' : 'Store URL is available',
    };
  }
}

export default UserService;
