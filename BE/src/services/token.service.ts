/**
 * Token Service
 * Handles JWT generation, verification, and session management
 */

import jwt, { SignOptions } from "jsonwebtoken"
import crypto from "crypto"
import { env } from "@/config/environment"
import { prisma } from "@/config/database"
import { UnauthorizedError } from "@/utils/errors"
import { UserRole } from "@prisma/client"
import type { StringValue } from "ms"

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
}
export class TokenService {
  /**
   * Generate short-lived access token (15 minutes)
   */
  static generateAccessToken(payload: JWTPayload): string {
    const options: SignOptions = {
      expiresIn: env.JWT_ACCESS_EXPIRY as StringValue,
      issuer: "genzaic-api",
      audience: "genzaic-app",
    }

    return jwt.sign(payload, env.JWT_ACCESS_SECRET, options)
  }

  /**
   * Generate long-lived refresh token (7 days)
   */
  static generateRefreshToken(payload: JWTPayload): string {
    const options: SignOptions = {
      expiresIn: env.JWT_REFRESH_EXPIRY as StringValue,
      issuer: "genzaic-api",
      audience: "genzaic-app",
    }
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, options)
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
        issuer: "genzaic-api",
        audience: "genzaic-app",
      }) as JWTPayload

      return payload
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError("Access token has expired")
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError("Invalid access token")
      }
      throw new UnauthorizedError("Token verification failed")
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): JWTPayload {
    try {
      const payload = jwt.verify(token, env.JWT_REFRESH_SECRET, {
        issuer: "genzaic-api",
        audience: "genzaic-app",
      }) as JWTPayload

      return payload
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError(
          "Refresh token has expired. Please login again."
        )
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError("Invalid refresh token")
      }
      throw new UnauthorizedError("Token verification failed")
    }
  }

  /**
   * Create session in database
   */
  static async createSession(
    userId: string,
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Calculate expiry (7 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Generate unique session token
    const sessionToken = crypto.randomBytes(32).toString("hex")

    // Create session record
    const session = await prisma.session.create({
      data: {
        userId,
        token: sessionToken,
        refreshToken,
        ipAddress,
        userAgent,
        expiresAt,
      },
    })

    return session
  }

  /**
   * Invalidate session (logout)
   */
  static async invalidateSession(refreshToken: string) {
    await prisma.session.deleteMany({
      where: { refreshToken },
    })
  }

  /**
   * Invalidate all user sessions (for security events like password reset)
   */
  static async invalidateAllUserSessions(userId: string) {
    await prisma.session.deleteMany({
      where: { userId },
    })
  }

  /**
   * Verify session exists and is valid
   */
  static async verifySession(refreshToken: string) {
    const session = await prisma.session.findFirst({
      where: {
        refreshToken,
        expiresAt: { gt: new Date() }, // Not expired
      },
    })

    if (!session) {
      throw new UnauthorizedError(
        "Invalid or expired session. Please login again."
      )
    }

    return session
  }

  /**
   * Cleanup expired sessions (can be run periodically)
   */
  static async cleanupExpiredSessions() {
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    })

    return result.count
  }

  /**
   * Get active sessions for a user
   */
  static async getUserSessions(userId: string) {
    return await prisma.session.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    })
  }
}

export default TokenService
