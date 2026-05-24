import { logger } from "@/lib/logger"

type EmailSend<T = unknown> = () => Promise<T>

interface RetryOptions {
  /** Human label used in structured logs. */
  label: string
  /** Recipient — included in logs so failed sends can be diagnosed. */
  to: string
  /** Default 3 attempts (initial + 2 retries). */
  attempts?: number
  /** Initial backoff in ms; doubles each retry. Default 300ms. */
  initialDelayMs?: number
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Send an email with exponential backoff. Designed to be paired with Next.js
 * `after()` so the request thread is never blocked:
 *
 *   import { after } from "next/server"
 *   after(() => sendEmailWithRetry(() => sendVerificationEmail(...), { ... }))
 *
 * Returns the underlying send result on success. On terminal failure logs a
 * structured error (which Sentry/observability tooling will pick up once
 * wired) and re-throws so an orchestrating saga can see it. Callers using
 * `after()` should NOT await — failures must not affect the user response.
 */
export async function sendEmailWithRetry<T>(
  send: EmailSend<T>,
  opts: RetryOptions,
): Promise<T> {
  const attempts = opts.attempts ?? 3
  const initialDelay = opts.initialDelayMs ?? 300
  let lastErr: unknown

  for (let i = 0; i < attempts; i++) {
    try {
      const result = await send()
      if (i > 0) {
        logger.info("email.retry_success", {
          meta: { label: opts.label, to: opts.to, attempt: i + 1 },
        })
      }
      return result
    } catch (err) {
      lastErr = err
      const isLast = i === attempts - 1
      if (isLast) break
      const delay = initialDelay * Math.pow(2, i)
      logger.warn("email.retry_attempt_failed", {
        meta: {
          label: opts.label,
          to: opts.to,
          attempt: i + 1,
          nextDelayMs: delay,
        },
        error: err,
      })
      await sleep(delay)
    }
  }

  logger.error("email.send_failed", {
    meta: { label: opts.label, to: opts.to, attempts },
    error: lastErr,
  })
  throw lastErr
}
