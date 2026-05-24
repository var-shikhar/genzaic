import { z } from "zod"

/**
 * Centralized, Zod-validated access to `process.env`.
 *
 * Validation runs once at module import time — if a required env var is
 * missing or malformed the app fails fast at startup rather than crashing
 * deep inside a request handler. Server code MUST read env via this module
 * instead of `process.env.X!`.
 *
 * `NEXT_PUBLIC_*` variables are inlined by the bundler at build time, but
 * we still validate them here so the build / SSR shape is sound.
 */
const envSchema = z.object({
  // ─── Database ────────────────────────────────────────────────────────────
  DATABASE_URL: z.string().url(),

  // ─── NextAuth ────────────────────────────────────────────────────────────
  // NEXTAUTH_URL is optional in v5 — it auto-detects from request headers
  // when trustHost is set.
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // ─── ImageKit ────────────────────────────────────────────────────────────
  IMAGEKIT_PUBLIC_KEY: z.string().min(1),
  IMAGEKIT_PRIVATE_KEY: z.string().min(1),
  IMAGEKIT_URL_ENDPOINT: z.string().url(),

  // ─── Email (Resend) ──────────────────────────────────────────────────────
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().email().default("noreply@genzaic.com"),

  // ─── Google AI (product-text extraction) ─────────────────────────────────
  GOOGLE_AI_API_KEY: z.string().min(1),

  // ─── Razorpay (KYC penny-drop + VPA validation) ──────────────────────────
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),

  // ─── Firebase (Cloud Messaging) — optional until provisioned, made required at rollout ───
  FIREBASE_SERVICE_ACCOUNT_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_VAPID_KEY: z.string().optional(),

  // ─── Cron auth ────────────────────────────────────────────────────────────
  CRON_SECRET: z.string().min(16, "CRON_SECRET must be at least 16 chars (Vercel cron auth)").optional(),

  // ─── Feature flags ────────────────────────────────────────────────────────
  NEXT_PUBLIC_NOTIFICATIONS_OPT_IN_ENABLED: z
    .enum(["true", "false"])
    .default("false"),

  // ─── App ─────────────────────────────────────────────────────────────────
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // ─── Runtime ─────────────────────────────────────────────────────────────
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
})

function parseEnv() {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    const issues = parsed.error.flatten().fieldErrors
    console.error("❌ Invalid environment variables:")
    for (const [key, errs] of Object.entries(issues)) {
      console.error(`   ${key}: ${errs?.join(", ")}`)
    }
    throw new Error(
      "Environment validation failed — see logs above. Check .env.local against .env.example.",
    )
  }
  return parsed.data
}

export const env = parseEnv()
export type Env = z.infer<typeof envSchema>
