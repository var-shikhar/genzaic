/**
 * Validation Middleware
 * Validates request body against Zod schemas
 */

import { Request, Response, NextFunction } from "express"
import { ZodSchema, ZodError } from "zod"
import { ValidationError } from "@/utils/errors"

/**
 * Preprocess FormData to convert string values to proper types
 */
const preprocessFormData = (body: any): any => {
  const processed: any = {}

  for (const key in body) {
    const value = body[key]

    // Skip if undefined or null
    if (value === undefined || value === null || value === "") {
      continue
    }

    // Convert string "true"/"false" to boolean
    if (value === "true") {
      processed[key] = true
      continue
    }
    if (value === "false") {
      processed[key] = false
      continue
    }

    // Convert numeric strings to numbers
    if (
      typeof value === "string" &&
      !isNaN(Number(value)) &&
      value.trim() !== ""
    ) {
      processed[key] = Number(value)
      continue
    }

    // Keep as-is
    processed[key] = value
  }

  return processed
}

export const validate = (
  schema: ZodSchema,
  source: "body" | "query" = "body"
) => {
  return (req: Request, _: Response, next: NextFunction) => {
    try {
      // Get data from the specified source
      const data = source === "query" ? req.query : req.body

      // Preprocess if it's form data (detect by checking if files exist)
      const processedData = req.files ? preprocessFormData(data) : data

      // Validate and transform
      const validated = schema.parse(processedData)

      // Update the request object
      if (source === "query") {
        req.query = validated as any
      } else {
        req.body = validated
      }

      next()
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors into user-friendly messages
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }))

        const errorMessage = errors
          .map((e) => `${e.field}: ${e.message}`)
          .join(", ")

        next(new ValidationError(errorMessage))
      } else {
        next(error)
      }
    }
  }
}

export default validate
