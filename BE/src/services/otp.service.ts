/**
 * OTP Service
 * Handles OTP and password reset token generation
 */

import crypto from 'crypto';
import { env } from '@/config/environment';

export class OTPService {
  /**
   * Generate cryptographically secure numeric OTP
   * @returns 6-digit OTP string
   */
  static generate(): string {
    const length = env.OTP_LENGTH;
    const digits = '0123456789';
    let otp = '';

    // Use crypto.randomInt for cryptographically secure random numbers
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, digits.length);
      otp += digits[randomIndex];
    }

    return otp;
  }

  /**
   * Calculate OTP expiry time
   * @returns Date object representing expiry time
   */
  static getExpiryTime(): Date {
    const expiryMinutes = env.OTP_EXPIRY_MINUTES;
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + expiryMinutes);
    return expiryTime;
  }

  /**
   * Check if OTP has expired
   * @param expiryTime - The expiry date to check
   * @returns true if expired, false otherwise
   */
  static isExpired(expiryTime: Date): boolean {
    return new Date() > expiryTime;
  }

  /**
   * Generate cryptographically secure password reset token
   * @returns 64-character hex string
   */
  static generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Calculate password reset token expiry
   * @returns Date object representing expiry time
   */
  static getResetTokenExpiry(): Date {
    const expiryHours = env.PASSWORD_RESET_EXPIRY_HOURS;
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + expiryHours);
    return expiryTime;
  }

  /**
   * Validate OTP format (numeric, correct length)
   * @param otp - OTP to validate
   * @returns true if valid format, false otherwise
   */
  static isValidFormat(otp: string): boolean {
    const otpRegex = new RegExp(`^\\d{${env.OTP_LENGTH}}$`);
    return otpRegex.test(otp);
  }

  /**
   * Generate a secure random verification code (alphanumeric)
   * Useful for alternative verification methods
   * @param length - Length of code to generate
   * @returns Random alphanumeric string
   */
  static generateAlphanumericCode(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, chars.length);
      code += chars[randomIndex];
    }

    return code;
  }
}

export default OTPService;
