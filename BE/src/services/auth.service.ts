/**
 * Auth Service
 * Core authentication business logic
 */

import bcrypt from 'bcrypt';
import { prisma } from '@/config/database';
import { env } from '@/config/environment';
import { TokenService } from './token.service';
import { OTPService } from './otp.service';
import { EmailService } from './email.service';
import { BuyerService } from './buyer.service';
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
  NotFoundError,
} from '@/utils/errors';
import { UserRole } from '@prisma/client';
import { logger } from '@/utils/logger';

export class AuthService {
  /**
   * Signup - Create user and send verification email
   */
  static async signup(
    name: string,
    email: string,
    password: string,
    role: UserRole = UserRole.buyer
  ) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

    // Generate OTP and expiry
    const otp = OTPService.generate();
    const otpExpiry = OTPService.getExpiryTime();

    // Generate unique store URL for sellers
    let storeUrl: string | null = null;
    if (role === UserRole.seller) {
      const baseStoreUrl = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      storeUrl = baseStoreUrl;
      let counter = 1;

      // Ensure uniqueness
      while (await prisma.user.findUnique({ where: { storeUrl: storeUrl! } })) {
        storeUrl = `${baseStoreUrl}-${counter}`;
        counter++;
      }
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        isSeller: role === UserRole.seller,
        storeUrl,
        emailVerificationToken: otp,
        emailVerificationExpiresAt: otpExpiry,
        onboardingComplete: role === UserRole.buyer, // Buyers skip onboarding
      },
    });

    // Create storefront for sellers
    if (role === UserRole.seller) {
      await prisma.storefront.create({
        data: {
          userId: user.id,
          storeUrl: storeUrl!,
          storeName: name,
          tagline: `Digital products by ${name}`,
          themeId: 'modern',
          primaryColor: '#6366f1',
          fontFamily: 'Inter',
          isPublished: false,
        },
      });
    }

    // Send verification email
    try {
      await EmailService.sendVerificationEmail(email, name, otp);
      logger.info(`Verification email sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send verification email to ${email}:`, error);
      // Don't fail signup if email fails - user can resend
    }

    // Link any guest orders to this new account
    try {
      const linkResult = await BuyerService.linkGuestOrdersToUser(email, user.id);
      if (linkResult.linkedCount > 0) {
        logger.info(`Linked ${linkResult.linkedCount} guest order(s) to user ${email}`);
      }
    } catch (error) {
      logger.error(`Failed to link guest orders for ${email}:`, error);
      // Don't fail signup if order linking fails
    }

    return {
      message:
        'Signup successful. Please check your email to verify your account.',
      userId: user.id,
      email: user.email,
      requiresVerification: true,
    };
  }

  /**
   * Verify email with OTP
   */
  static async verifyEmail(
    email: string,
    otp: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { storefront: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.emailVerified) {
      throw new ValidationError('Email already verified');
    }

    if (!user.emailVerificationToken || !user.emailVerificationExpiresAt) {
      throw new ValidationError(
        'No verification token found. Please request a new one.'
      );
    }

    if (user.emailVerificationToken !== otp) {
      throw new ValidationError('Invalid OTP');
    }

    if (OTPService.isExpired(user.emailVerificationExpiresAt)) {
      throw new ValidationError('OTP has expired. Please request a new one.');
    }

    // Update user as verified
    const verifiedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
        lastLoginAt: new Date(),
      },
      include: { storefront: true },
    });

    // Generate tokens
    const accessToken = TokenService.generateAccessToken({
      userId: verifiedUser.id,
      email: verifiedUser.email,
      role: verifiedUser.role,
    });

    const refreshToken = TokenService.generateRefreshToken({
      userId: verifiedUser.id,
      email: verifiedUser.email,
      role: verifiedUser.role,
    });

    // Create session
    await TokenService.createSession(
      verifiedUser.id,
      refreshToken,
      ipAddress,
      userAgent
    );

    // Send welcome email (non-blocking)
    EmailService.sendWelcomeEmail(
      verifiedUser.email,
      verifiedUser.name,
      verifiedUser.role
    ).catch((error) => {
      logger.error('Failed to send welcome email:', error);
    });

    return {
      user: this.formatUserResponse(verifiedUser),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login with email and password
   */
  static async login(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { storefront: true },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new UnauthorizedError(
        'Please verify your email before logging in. Check your inbox for the verification code.'
      );
    }

    // Check if account is active
    if (!user.isActive) {
      throw new UnauthorizedError('Account has been deactivated');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const accessToken = TokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = TokenService.generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Create session
    await TokenService.createSession(user.id, refreshToken, ipAddress, userAgent);

    // Link any guest orders to this account (in case user made purchases before logging in)
    try {
      const linkResult = await BuyerService.linkGuestOrdersToUser(email, user.id);
      if (linkResult.linkedCount > 0) {
        logger.info(`Linked ${linkResult.linkedCount} guest order(s) to user ${email} on login`);
      }
    } catch (error) {
      logger.error(`Failed to link guest orders for ${email}:`, error);
      // Don't fail login if order linking fails
    }

    logger.info(`User logged in: ${email}`);

    return {
      user: this.formatUserResponse(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Logout - Invalidate session
   */
  static async logout(refreshToken: string) {
    await TokenService.invalidateSession(refreshToken);
    logger.info('User logged out successfully');
    return { message: 'Logged out successfully' };
  }

  /**
   * Forgot password - Send reset email
   */
  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists (security best practice)
    if (!user) {
      logger.warn(`Password reset requested for non-existent email: ${email}`);
      return {
        message:
          'If an account exists with this email, a password reset link has been sent.',
      };
    }

    // Generate reset token
    const resetToken = OTPService.generateResetToken();
    const resetExpiry = OTPService.getResetTokenExpiry();

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiresAt: resetExpiry,
      },
    });

    // Send reset email
    try {
      await EmailService.sendPasswordResetEmail(
        user.email,
        user.name,
        resetToken
      );
      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send password reset email to ${email}:`, error);
      throw new Error('Failed to send password reset email');
    }

    return {
      message:
        'If an account exists with this email, a password reset link has been sent.',
    };
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      throw new ValidationError(
        'Invalid or expired reset token. Please request a new password reset.'
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      },
    });

    // Invalidate all sessions for security
    await TokenService.invalidateAllUserSessions(user.id);

    logger.info(`Password reset successfully for user: ${user.email}`);

    return {
      message:
        'Password reset successful. Please login with your new password.',
    };
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(refreshToken: string) {
    // Verify refresh token
    const payload = TokenService.verifyRefreshToken(refreshToken);

    // Verify session exists
    await TokenService.verifySession(refreshToken);

    // Generate new access token
    const newAccessToken = TokenService.generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    logger.info(`Access token refreshed for user: ${payload.email}`);

    return { accessToken: newAccessToken };
  }

  /**
   * Get current user by ID
   */
  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { storefront: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.formatUserResponse(user);
  }

  /**
   * Resend OTP for email verification
   */
  static async resendOTP(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.emailVerified) {
      throw new ValidationError('Email already verified');
    }

    // Generate new OTP
    const otp = OTPService.generate();
    const otpExpiry = OTPService.getExpiryTime();

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: otp,
        emailVerificationExpiresAt: otpExpiry,
      },
    });

    // Send email
    try {
      await EmailService.sendVerificationEmail(user.email, user.name, otp);
      logger.info(`Verification OTP resent to ${email}`);
    } catch (error) {
      logger.error(`Failed to resend OTP to ${email}:`, error);
      throw new Error('Failed to send verification email');
    }

    return { message: 'Verification email sent successfully' };
  }

  /**
   * Format user response (remove sensitive data)
   */
  private static formatUserResponse(user: any) {
    const {
      passwordHash,
      emailVerificationToken,
      emailVerificationExpiresAt,
      passwordResetToken,
      passwordResetExpiresAt,
      ...safeUser
    } = user;

    // Format storefront settings if present
    if (safeUser.storefront) {
      return {
        ...safeUser,
        storefrontSettings: safeUser.storefront,
        storefront: undefined,
      };
    }

    return safeUser;
  }
}

export default AuthService;
