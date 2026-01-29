/**
 * Auth Controller
 * HTTP request handlers for authentication endpoints
 */

import { Request, Response, NextFunction } from "express"
import { AuthService } from "@/services/auth.service"
import { env } from "@/config/environment"

export class AuthController {
  /**
   * POST /api/auth/signup
   * Register a new user
   */
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, role } = req.body

      const result = await AuthService.signup(name, email, password, role)

      res.status(201).json({
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/auth/verify-email
   * Verify email with OTP and login user
   */
  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body
      const ipAddress = req.ip
      const userAgent = req.get("user-agent")

      const result = await AuthService.verifyEmail(
        email,
        otp,
        ipAddress,
        userAgent
      )

      // Set httpOnly cookies
      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.COOKIE_SAME_SITE,
        ...(env.COOKIE_DOMAIN && { domain: env.COOKIE_DOMAIN }), // Only set domain if provided
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: "/",
      })

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.COOKIE_SAME_SITE,
        ...(env.COOKIE_DOMAIN && { domain: env.COOKIE_DOMAIN }), // Only set domain if provided
        maxAge: 12 * 60 * 60 * 1000, // 12 hours
        path: "/",
      })

      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          message: "Email verified successfully",
        },
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/auth/login
   * Login with email and password
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body
      const ipAddress = req.ip
      const userAgent = req.get("user-agent")

      const result = await AuthService.login(
        email,
        password,
        ipAddress,
        userAgent
      )

      // Set httpOnly cookies
      console.log(`Logs: Secure: ${env.NODE_ENV}, SameSite: ${env.COOKIE_SAME_SITE}, Domain: ${env.COOKIE_DOMAIN}`)
      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.COOKIE_SAME_SITE,
        // ...(env.COOKIE_DOMAIN && { domain: env.COOKIE_DOMAIN }), // Only set domain if provided
        maxAge: 15 * 60 * 1000,
        path: "/",
      })

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.COOKIE_SAME_SITE,
        // ...(env.COOKIE_DOMAIN && { domain: env.COOKIE_DOMAIN }), // Only set domain if provided
        maxAge: 12 * 60 * 60 * 1000, // 12 hours
        path: "/",
      })

      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          message: "Login successful",
        },
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/auth/logout
   * Logout and invalidate session
   */
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken

      if (refreshToken) {
        await AuthService.logout(refreshToken)
      }

      // Clear cookies
      res.clearCookie("accessToken", { path: "/" })
      res.clearCookie("refreshToken", { path: "/" })

      res.status(200).json({
        success: true,
        data: { message: "Logged out successfully" },
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/auth/forgot-password
   * Send password reset email
   */
  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body

      const result = await AuthService.forgotPassword(email)

      res.status(200).json({
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/auth/reset-password
   * Reset password with token
   */
  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body

      const result = await AuthService.resetPassword(token, newPassword)

      res.status(200).json({
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/auth/me
   * Get current authenticated user
   */
  static async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId

      const user = await AuthService.getCurrentUser(userId)

      res.status(200).json({
        success: true,
        data: { user },
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/auth/refresh
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken

      if (!refreshToken) {
        throw new Error("Refresh token not found")
      }

      const result = await AuthService.refreshAccessToken(refreshToken)

      // Set new access token cookie
      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.COOKIE_SAME_SITE,
        ...(env.COOKIE_DOMAIN && { domain: env.COOKIE_DOMAIN }), // Only set domain if provided
        maxAge: 15 * 60 * 1000,
        path: "/",
      })

      res.status(200).json({
        success: true,
        data: { message: "Access token refreshed successfully" },
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/auth/resend-otp
   * Resend email verification OTP
   */
  static async resendOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body

      const result = await AuthService.resendOTP(email)

      res.status(200).json({
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }
}

export default AuthController
