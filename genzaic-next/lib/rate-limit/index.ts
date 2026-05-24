import "server-only"
import { NextResponse, type NextRequest } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { env } from "@/lib/env"

// ─── Rate limiter (Upstash sliding-window with in-memory fallback) ───────────
//
// When both UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set, every
// `enforceRateLimit` call goes through Upstash's REST API — so counters are
// shared across every serverless container globally. Without those env vars,
// we fall back to the per-instance in-memory limiter below, which is fine for
// local dev and single-instance deployments but is *not* a defence against
// deliberate abuse under serverless fan-out.
//
// The fallback also kicks in transparently if Upstash itself errors mid-flight
// — better to let the request through than to 500 because the limiter died.

// ─── In-memory fallback ───────────────────────────────────────────────────────

interface BucketState {
  count: number
  resetAt: number
}

const buckets = new Map<string, BucketState>()
const MAX_BUCKETS = 50_000

// Periodic cleanup so the map can't grow unbounded under attack.
if (typeof window === "undefined") {
  const cleanup = setInterval(() => {
    const now = Date.now()
    for (const [key, state] of buckets) {
      if (state.resetAt <= now) buckets.delete(key)
    }
    if (buckets.size > MAX_BUCKETS) {
      const overflow = buckets.size - MAX_BUCKETS
      let removed = 0
      for (const key of buckets.keys()) {
        buckets.delete(key)
        if (++removed >= overflow) break
      }
    }
  }, 60_000)
  if (cleanup.unref) cleanup.unref()
}

export interface RateLimitOptions {
  /** Maximum number of requests in the window. */
  max: number
  /** Window length in seconds. */
  windowSec: number
}

export interface RateLimitResult {
  ok: boolean
  remaining: number
  resetAt: number
}

function checkInMemory(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const state = buckets.get(key)

  if (!state || state.resetAt <= now) {
    const fresh: BucketState = { count: 1, resetAt: now + opts.windowSec * 1000 }
    buckets.set(key, fresh)
    return { ok: true, remaining: opts.max - 1, resetAt: fresh.resetAt }
  }

  state.count += 1
  const ok = state.count <= opts.max
  return {
    ok,
    remaining: Math.max(0, opts.max - state.count),
    resetAt: state.resetAt,
  }
}

// ─── Upstash (lazy, only built when configured) ──────────────────────────────

const isUpstashConfigured = Boolean(
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN,
)

let redis: Redis | null = null
function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL!,
      token: env.UPSTASH_REDIS_REST_TOKEN!,
    })
  }
  return redis
}

// One Ratelimit instance per (max, windowSec) tuple. Building one per request
// would burn CPU recompiling the underlying Lua script.
const ratelimitCache = new Map<string, Ratelimit>()
function getRatelimit(opts: RateLimitOptions): Ratelimit {
  const cacheKey = `${opts.max}:${opts.windowSec}`
  let limiter = ratelimitCache.get(cacheKey)
  if (!limiter) {
    limiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(opts.max, `${opts.windowSec} s`),
      analytics: false,
      // The `prefix` is per-Ratelimit, not per-call. We embed the scope into
      // the identifier (`enforceRateLimit` builds `${scope}:${ip}`) so all
      // scopes can share one cached limiter for a given (max, window) tuple.
      prefix: "ratelimit",
    })
    ratelimitCache.set(cacheKey, limiter)
  }
  return limiter
}

async function checkUpstash(
  key: string,
  opts: RateLimitOptions,
): Promise<RateLimitResult> {
  const limiter = getRatelimit(opts)
  const res = await limiter.limit(key)
  return {
    ok: res.success,
    remaining: res.remaining,
    resetAt: res.reset,
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Async because Upstash is a REST call. Falls back to the in-memory check on
 * any Upstash error so a transient outage of the limiter never 500s your API.
 */
export async function checkRateLimit(
  key: string,
  opts: RateLimitOptions,
): Promise<RateLimitResult> {
  if (isUpstashConfigured) {
    try {
      return await checkUpstash(key, opts)
    } catch (err) {
      console.warn("[rate-limit] upstash failed, falling back to in-memory:", err)
      return checkInMemory(key, opts)
    }
  }
  return checkInMemory(key, opts)
}

/**
 * Extract a stable client identifier from the request headers. Prefers
 * `x-forwarded-for` (Vercel injects this), then `x-real-ip`, falling back to
 * a generic bucket. Note: shared NAT gateways will share a key — that's the
 * accepted trade-off for IP-based limiting.
 */
export function getClientKey(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for")
  if (xff) return xff.split(",")[0]!.trim()
  const real = req.headers.get("x-real-ip")
  if (real) return real
  return "anonymous"
}

/**
 * Async wrapper that checks the limit and returns a 429 NextResponse if
 * exceeded. Returns `null` to signal "ok, proceed". Use at the top of an API
 * route handler:
 *
 *   const limited = await enforceRateLimit(req, "signup", { max: 5, windowSec: 300 })
 *   if (limited) return limited
 */
export async function enforceRateLimit(
  req: NextRequest,
  scope: string,
  opts: RateLimitOptions,
): Promise<NextResponse | null> {
  const key = `${scope}:${getClientKey(req)}`
  const result = await checkRateLimit(key, opts)

  const headers = {
    "X-RateLimit-Limit": String(opts.max),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  }

  if (!result.ok) {
    const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: {
          ...headers,
          "Retry-After": String(retryAfter),
        },
      },
    )
  }

  return null
}
