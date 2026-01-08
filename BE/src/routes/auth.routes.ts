/**
 * Auth Routes
 * Authentication API endpoints
 */

import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import {
  validate,
  authenticate,
  authLimiter,
  otpLimiter,
  passwordResetLimiter,
} from '@/middleware';
import {
  signupSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendOTPSchema,
} from '@/validators/auth.validators';

const router = Router();

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

/**
 * POST /api/auth/signup
 * Register a new user
 */
router.post(
  '/signup',
  authLimiter,
  validate(signupSchema),
  AuthController.signup
);

/**
 * POST /api/auth/verify-email
 * Verify email with OTP
 */
router.post(
  '/verify-email',
  authLimiter,
  validate(verifyEmailSchema),
  AuthController.verifyEmail
);

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
router.post(
  '/forgot-password',
  passwordResetLimiter,
  validate(forgotPasswordSchema),
  AuthController.forgotPassword
);

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordSchema),
  AuthController.resetPassword
);

/**
 * POST /api/auth/resend-otp
 * Resend email verification OTP
 */
router.post(
  '/resend-otp',
  otpLimiter,
  validate(resendOTPSchema),
  AuthController.resendOTP
);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', AuthController.refreshToken);

// ============================================================================
// PROTECTED ROUTES (Require Authentication)
// ============================================================================

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authenticate, AuthController.getCurrentUser);

/**
 * POST /api/auth/logout
 * Logout and invalidate session
 */
router.post('/logout', authenticate, AuthController.logout);

export default router;
