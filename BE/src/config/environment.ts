/**
 * Environment Configuration with Zod Validation
 * Ensures all required environment variables are present and valid
 */

import { z } from "zod"
import dotenv from "dotenv"
import path from "path"

// Load .env file
dotenv.config({ path: path.join(process.cwd(), ".env") })

// Define environment schema with Zod
const envSchema = z.object({
  // Server
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .default("8081"),
  API_BASE_URL: z.string().url(),
  FRONTEND_URL: z.string().url(),

  // Database
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),

  // Cookie
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SECURE: z
    .string()
    .transform((val) => val === "true")
    .default("false"),
  COOKIE_SAME_SITE: z.enum(["strict", "lax", "none"]).default("lax"),

  // Security
  BCRYPT_SALT_ROUNDS: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .default("10"),
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .default("900000"),
  RATE_LIMIT_MAX_REQUESTS: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .default("100"),

  // CORS
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  CORS_CREDENTIALS: z
    .string()
    .transform((val) => val === "true")
    .default("true"),

  // Email
  EMAIL_SERVICE: z.enum(["ethereal", "sendgrid", "smtp"]).default("ethereal"),

  // OTP
  OTP_LENGTH: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .default("6"),
  OTP_EXPIRY_MINUTES: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .default("10"),

  // Password Reset
  PASSWORD_RESET_EXPIRY_HOURS: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .default("1"),

  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  LOG_FILE: z.string().default("logs/app.log"),

  // Platform
  PLATFORM_NAME: z.string().default("GenZaic Creator Hub"),
  PLATFORM_URL: z.string().url(),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  CLOUDINARY_UPLOAD_PRESET: z.string().optional(),

  // Optional SMTP settings
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_SECURE: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string(),
  FROM_NAME: z.string(),

  // Optional SendGrid settings
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().email().optional(),
  SENDGRID_FROM_NAME: z.string().optional(),

  // Google Drive
  GOOGLE_DRIVE_CLIENT_EMAIL: z.string().email(),
  GOOGLE_DRIVE_PRIVATE_KEY: z.string(),
  GOOGLE_DRIVE_SHARED_DRIVE_ID: z.string().optional(), // For Google Workspace shared drives
  USE_GOOGLE_DRIVE: z.string().transform((val) => val === "true").default("false"), // Feature flag
  
  // Google AI (for product extraction)
  GOOGLE_AI_API_KEY: z.string(),
})

// Parse and validate environment variables
let env: z.infer<typeof envSchema>

try {
  env = envSchema.parse(process.env)
  // Don't log here - will be logged in server.ts after logger is initialized
} catch (error) {
  console.error("❌ Invalid environment variables:")
  if (error instanceof z.ZodError) {
    error.errors.forEach((err) => {
      console.error(`  ❌ ${err.path.join(".")}: ${err.message}`)
    })
  }
  console.error("\n💡 Please check your .env file and ensure all required variables are set.")
  process.exit(1)
}

export { env }
export type Env = z.infer<typeof envSchema>
