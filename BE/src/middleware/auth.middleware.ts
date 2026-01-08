/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 */

import { Request, Response, NextFunction } from "express"
import { TokenService } from "@/services/token.service"
import { UnauthorizedError, ForbiddenError } from "@/utils/errors"
import { UserRole } from "@prisma/client"

/**
 * Authenticate user via JWT from cookie
 * Requires valid access token
 */
export const authenticate = (req: Request, _: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies.accessToken

    if (!accessToken) {
      throw new UnauthorizedError(
        "Access token not found. Please login to continue."
      )
    }

    // Verify token and extract payload
    const payload = TokenService.verifyAccessToken(accessToken)

    // Attach user info to request
    req.user = payload

    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Authorize specific roles
 * Must be used after authenticate middleware
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new UnauthorizedError("Authentication required to access this resource")
      )
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError("You do not have permission to access this resource")
      )
    }

    next()
  }
}

/**
 * Optional authentication
 * Does not fail if token is missing or invalid
 * Useful for public routes that may show different content for authenticated users
 */
export const optionalAuth = (req: Request, _: Response, next: NextFunction) => {
  const accessToken = req.cookies.accessToken

  if (accessToken) {
    try {
      const payload = TokenService.verifyAccessToken(accessToken)
      req.user = payload
    } catch (error) {
      // Ignore token errors for optional auth
    }
  }

  next()
}

export default { authenticate, authorize, optionalAuth }
