import "server-only"
import { NextResponse, type NextRequest } from "next/server"

// ─── In-memory token-bucket rate limiter ─────────────────────────────────────
//
// Per-key sliding-window counter held on the Node process. Survives across
// requests within the same warm function instance. On Vercel each instance
// has its own state — that means a single bad actor *can* in theory burst
// to N × <instance count>, but at our target scale (5000 users/hour) Vercel
// keeps a small instance pool warm and this is enough protection against
// accidental loops, naive scrapers, and brute-force probes.
//
// To upgrade to a globally-shared limiter (Upstash Redis, Cloudflare KV,
// Durable Objects, etc.), only this file needs to change — the call sites
// stay identical.

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
    // Hard cap as a safety net.
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

/**
 * Increment the bucket for `key` and return whether the caller is within the
 * configured budget. Pure function — no I/O, ~microsecond cost.
 */
export function checkRateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
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
 * Convenience wrapper that checks the limit and returns a 429 NextResponse
 * if exceeded. Returns `null` to signal "ok, proceed". Use at the top of an
 * API route handler:
 *
 *   const limited = enforceRateLimit(req, "public-storefront", { max: 60, windowSec: 60 })
 *   if (limited) return limited
 */
export function enforceRateLimit(
  req: NextRequest,
  scope: string,
  opts: RateLimitOptions,
): NextResponse | null {
  const key = `${scope}:${getClientKey(req)}`
  const result = checkRateLimit(key, opts)

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
