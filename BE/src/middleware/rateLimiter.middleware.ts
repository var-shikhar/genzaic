/**
 * Rate Limiter Middleware
 * Prevents abuse and brute force attacks
 */

import rateLimit from 'express-rate-limit';
import { env } from '@/config/environment';

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  // Skip successful requests from the count
  skipSuccessfulRequests: false,
});

/**
 * Stricter rate limiter for authentication endpoints
 * 5 attempts per 15 minutes per IP
 * Prevents brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message:
      'Too many authentication attempts from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Don't count successful requests (login success)
  skipSuccessfulRequests: true,
});

/**
 * OTP resend rate limiter
 * 3 requests per 5 minutes per IP
 * Prevents OTP spam
 */
export const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3,
  message: {
    success: false,
    message: 'Too many OTP requests, please try again in 5 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Password reset rate limiter
 * 3 requests per hour per IP
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    message: 'Too many password reset requests, please try again in an hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default {
  apiLimiter,
  authLimiter,
  otpLimiter,
  passwordResetLimiter,
};
