import fs from "fs"
import path from "path"
import { env } from "@/lib/env"

// ─── Log Levels ───────────────────────────────────────────────────────────────
export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal"

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
}

const LEVEL_LABELS: Record<LogLevel, string> = {
  debug: "DEBUG",
  info: "INFO ",
  warn: "WARN ",
  error: "ERROR",
  fatal: "FATAL",
}

// ─── Configuration ────────────────────────────────────────────────────────────
const LOG_DIR = path.join(process.cwd(), "logs")
const MIN_LEVEL: LogLevel = env.LOG_LEVEL
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB per file before rotation
const ENABLE_CONSOLE = env.NODE_ENV !== "test"
const ENABLE_FILE = typeof window === "undefined" // only server-side

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDateString(): string {
  const now = new Date()
  return now.toISOString().split("T")[0] // YYYY-MM-DD
}

function getTimestamp(): string {
  return new Date().toISOString()
}

function ensureLogDir(): void {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true })
  }
}

function getLogFilePath(date: string, level?: "error"): string {
  if (level === "error") {
    return path.join(LOG_DIR, `${date}-error.log`)
  }
  return path.join(LOG_DIR, `${date}.log`)
}

function rotateIfNeeded(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath)
      if (stats.size >= MAX_FILE_SIZE) {
        const rotatedPath = filePath.replace(".log", `-${Date.now()}.log`)
        fs.renameSync(filePath, rotatedPath)
      }
    }
  } catch {
    // Rotation failure shouldn't break logging
  }
}

function writeToFile(filePath: string, line: string): void {
  try {
    ensureLogDir()
    rotateIfNeeded(filePath)
    fs.appendFileSync(filePath, line + "\n", "utf-8")
  } catch {
    // File write failure shouldn't break the app
  }
}

// ─── Log Entry ────────────────────────────────────────────────────────────────

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: string
  requestId?: string
  userId?: string
  method?: string
  path?: string
  statusCode?: number
  duration?: number
  error?: {
    name: string
    message: string
    stack?: string
  }
  meta?: Record<string, unknown>
}

function formatForConsole(entry: LogEntry): string {
  const parts = [
    `[${entry.timestamp}]`,
    `[${LEVEL_LABELS[entry.level]}]`,
  ]

  if (entry.context) parts.push(`[${entry.context}]`)
  if (entry.requestId) parts.push(`[${entry.requestId}]`)

  parts.push(entry.message)

  if (entry.method && entry.path) {
    parts.push(`| ${entry.method} ${entry.path}`)
  }
  if (entry.statusCode) parts.push(`| ${entry.statusCode}`)
  if (entry.duration !== undefined) parts.push(`| ${entry.duration}ms`)
  if (entry.userId) parts.push(`| user:${entry.userId}`)

  if (entry.error) {
    parts.push(`\n  Error: ${entry.error.name}: ${entry.error.message}`)
    if (entry.error.stack && entry.level !== "warn") {
      parts.push(`\n  Stack: ${entry.error.stack}`)
    }
  }

  return parts.join(" ")
}

function formatForFile(entry: LogEntry): string {
  return JSON.stringify(entry)
}

// ─── Core Logger ──────────────────────────────────────────────────────────────

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[MIN_LEVEL]
}

function log(entry: LogEntry): void {
  if (!shouldLog(entry.level)) return

  // Console output (human-readable)
  if (ENABLE_CONSOLE) {
    const formatted = formatForConsole(entry)
    switch (entry.level) {
      case "debug":
        console.debug(formatted)
        break
      case "info":
        console.info(formatted)
        break
      case "warn":
        console.warn(formatted)
        break
      case "error":
      case "fatal":
        console.error(formatted)
        break
    }
  }

  // File output (structured JSON, day-wise)
  if (ENABLE_FILE) {
    const date = getDateString()
    const line = formatForFile(entry)

    // All logs go to the daily file
    writeToFile(getLogFilePath(date), line)

    // Errors also go to a separate error file for quick access
    if (entry.level === "error" || entry.level === "fatal") {
      writeToFile(getLogFilePath(date, "error"), line)
    }
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

interface LogOptions {
  context?: string
  requestId?: string
  userId?: string
  method?: string
  path?: string
  statusCode?: number
  duration?: number
  meta?: Record<string, unknown>
}

function createEntry(
  level: LogLevel,
  message: string,
  options?: LogOptions,
  error?: unknown,
): LogEntry {
  const entry: LogEntry = {
    timestamp: getTimestamp(),
    level,
    message,
    ...options,
  }

  if (error) {
    if (error instanceof Error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    } else {
      entry.error = {
        name: "UnknownError",
        message: String(error),
      }
    }
  }

  return entry
}

export const logger = {
  debug(message: string, options?: LogOptions) {
    log(createEntry("debug", message, options))
  },

  info(message: string, options?: LogOptions) {
    log(createEntry("info", message, options))
  },

  warn(message: string, options?: LogOptions & { error?: unknown }) {
    const { error: err, ...opts } = options ?? {}
    log(createEntry("warn", message, opts, err))
  },

  error(message: string, options?: LogOptions & { error?: unknown }) {
    const { error: err, ...opts } = options ?? {}
    log(createEntry("error", message, opts, err))
  },

  fatal(message: string, options?: LogOptions & { error?: unknown }) {
    const { error: err, ...opts } = options ?? {}
    log(createEntry("fatal", message, opts, err))
  },

  /** Log an API request with timing */
  request(
    method: string,
    urlPath: string,
    statusCode: number,
    duration: number,
    options?: Omit<LogOptions, "method" | "path" | "statusCode" | "duration">,
  ) {
    const level: LogLevel = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info"
    log(
      createEntry(level, `${method} ${urlPath} ${statusCode}`, {
        ...options,
        method,
        path: urlPath,
        statusCode,
        duration,
      }),
    )
  },
}

// ─── Request ID Generator ─────────────────────────────────────────────────────

let counter = 0
export function generateRequestId(): string {
  counter = (counter + 1) % 999999
  return `req_${Date.now().toString(36)}_${counter.toString(36).padStart(4, "0")}`
}

// ─── API Route Helper ─────────────────────────────────────────────────────────

/** Wraps an API route handler with automatic logging, timing, and error handling */
export function withLogger<T extends (...args: unknown[]) => Promise<Response>>(
  context: string,
  handler: T,
): T {
  return (async (...args: unknown[]) => {
    const requestId = generateRequestId()
    const start = Date.now()

    try {
      const response = await handler(...args)
      const duration = Date.now() - start

      // Extract method and path from first arg (NextRequest)
      const req = args[0] as { method?: string; url?: string } | undefined
      const method = req?.method ?? "UNKNOWN"
      const urlPath = req?.url ? new URL(req.url).pathname : context

      logger.request(method, urlPath, response.status, duration, { context, requestId })

      return response
    } catch (error) {
      const duration = Date.now() - start
      logger.error(`Unhandled error in ${context}`, {
        context,
        requestId,
        duration,
        error,
      })
      throw error
    }
  }) as T
}
