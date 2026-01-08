/**
 * Error Handler Middleware
 * Catches all errors and sends appropriate responses
 */

import { Request, Response, NextFunction } from "express"
import { AppError } from "@/utils/errors"
import { logger } from "@/utils/logger"
import { env } from "@/config/environment"
import { Prisma } from "@prisma/client"

/**
 * Global error handler
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _: NextFunction
) => {
  // Default to 500 if not an operational error
  let statusCode = 500
  let message = "Internal server error"

  if (err instanceof AppError) {
    // Operational errors (expected)
    statusCode = err.statusCode
    message = err.message

    logger.error({
      type: "AppError",
      statusCode: err.statusCode,
      message: err.message,
      path: req.path,
      method: req.method,
      ip: req.ip,
    })
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Prisma database errors
    statusCode = 400

    switch (err.code) {
      case "P2002":
        message = "A record with this value already exists"
        break
      case "P2025":
        message = "Record not found"
        statusCode = 404
        break
      case "P2003":
        message = "Invalid reference to related record"
        break
      default:
        message = "Database operation failed"
    }

    logger.error({
      type: "PrismaError",
      code: err.code,
      message: err.message,
      path: req.path,
    })
  } else {
    // Programming errors (unexpected)
    logger.error({
      type: "UnhandledError",
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    })

    // In production, don't expose error details
    if (env.NODE_ENV === "production") {
      message = "An unexpected error occurred"
    } else {
      message = err.message
    }
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV === "development" && {
      error: {
        stack: err.stack,
        ...err,
      },
    }),
  })
}

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn({
    type: "404",
    path: req.path,
    method: req.method,
    ip: req.ip,
  })

  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  })
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export default { errorHandler, notFoundHandler, asyncHandler }
