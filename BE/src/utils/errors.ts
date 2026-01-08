/**
 * Custom Error Classes for GenZaic Backend
 * Provides type-safe, HTTP-status-aware error handling
 */

export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(
    statusCode: number,
    message: string,
    isOperational: boolean = true
  ) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    Object.setPrototypeOf(this, AppError.prototype)
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation failed") {
    super(400, message)
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized access") {
    super(401, message)
    Object.setPrototypeOf(this, UnauthorizedError.prototype)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access forbidden") {
    super(403, message)
    Object.setPrototypeOf(this, ForbiddenError.prototype)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(404, message)
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(409, message)
    Object.setPrototypeOf(this, ConflictError.prototype)
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = "Too many requests") {
    super(429, message)
    Object.setPrototypeOf(this, TooManyRequestsError.prototype)
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error") {
    super(500, message, false)
    Object.setPrototypeOf(this, InternalServerError.prototype)
  }
}
