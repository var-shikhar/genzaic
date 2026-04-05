// ─── In-Memory Cache with TTL ─────────────────────────────────────────────────
//
// A lightweight, server-side in-memory cache for API response data.
// - TTL-based expiration (per-key or default)
// - Automatic stale entry cleanup on interval
// - Max size eviction (LRU-style: oldest entries evicted first)
// - Tag-based invalidation (e.g., invalidate all "products" cache at once)
// - Type-safe get/set
//

interface CacheEntry<T = unknown> {
  value: T
  expiresAt: number
  tags: string[]
  createdAt: number
}

interface CacheOptions {
  /** Time-to-live in seconds (default: 60) */
  ttl?: number
  /** Tags for group invalidation (e.g., ["products", "storefront:abc"]) */
  tags?: string[]
}

const DEFAULT_TTL = 60 // 1 minute
const MAX_ENTRIES = 5000
const CLEANUP_INTERVAL = 30_000 // 30 seconds

class MemoryCache {
  private store = new Map<string, CacheEntry>()
  private cleanupTimer: ReturnType<typeof setInterval> | null = null

  constructor() {
    // Start cleanup on server side only
    if (typeof window === "undefined") {
      this.startCleanup()
    }
  }

  /** Get a cached value. Returns undefined if missing or expired. */
  get<T>(key: string): T | undefined {
    const entry = this.store.get(key)
    if (!entry) return undefined

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return undefined
    }

    return entry.value as T
  }

  /** Set a value with optional TTL and tags. */
  set<T>(key: string, value: T, options?: CacheOptions): void {
    // Evict oldest entries if at capacity
    if (this.store.size >= MAX_ENTRIES && !this.store.has(key)) {
      this.evictOldest(Math.ceil(MAX_ENTRIES * 0.1)) // evict 10%
    }

    const ttl = options?.ttl ?? DEFAULT_TTL
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttl * 1000,
      tags: options?.tags ?? [],
      createdAt: Date.now(),
    })
  }

  /** Check if a non-expired entry exists. */
  has(key: string): boolean {
    return this.get(key) !== undefined
  }

  /** Delete a specific key. */
  delete(key: string): boolean {
    return this.store.delete(key)
  }

  /** Invalidate all entries matching ANY of the given tags. */
  invalidateByTags(tags: string[]): number {
    const tagSet = new Set(tags)
    let count = 0

    for (const [key, entry] of this.store) {
      if (entry.tags.some((t) => tagSet.has(t))) {
        this.store.delete(key)
        count++
      }
    }

    return count
  }

  /** Invalidate all entries whose keys start with the given prefix. */
  invalidateByPrefix(prefix: string): number {
    let count = 0

    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key)
        count++
      }
    }

    return count
  }

  /** Clear the entire cache. */
  clear(): void {
    this.store.clear()
  }

  /** Current number of entries (including potentially expired). */
  get size(): number {
    return this.store.size
  }

  /** Get-or-set pattern: returns cached value if exists, otherwise calls factory and caches result. */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== undefined) return cached

    const value = await factory()
    this.set(key, value, options)
    return value
  }

  // ─── Internal ─────────────────────────────────────────────────────────

  private evictOldest(count: number): void {
    const entries = [...this.store.entries()]
      .sort((a, b) => a[1].createdAt - b[1].createdAt)
      .slice(0, count)

    for (const [key] of entries) {
      this.store.delete(key)
    }
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key)
      }
    }
  }

  private startCleanup(): void {
    if (this.cleanupTimer) return
    this.cleanupTimer = setInterval(() => this.cleanup(), CLEANUP_INTERVAL)
    // Don't prevent process exit
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref()
    }
  }

  /** Stop the cleanup timer (for testing/shutdown). */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.clear()
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────
// Use globalThis to survive Next.js hot reloads in development

const globalForCache = globalThis as unknown as { __cache?: MemoryCache }

export const cache = globalForCache.__cache ?? new MemoryCache()

if (process.env.NODE_ENV !== "production") {
  globalForCache.__cache = cache
}

// ─── Pre-built Cache Key Builders ─────────────────────────────────────────────

export const cacheKeys = {
  // Products
  product: (id: string) => `product:${id}`,
  products: (storefrontId: string, page?: number) =>
    `products:${storefrontId}:${page ?? "all"}`,
  productStats: (storefrontId: string) => `product-stats:${storefrontId}`,

  // Storefronts
  storefront: (userId: string) => `storefront:${userId}`,
  publicStorefront: (storeUrl: string) => `public-storefront:${storeUrl}`,

  // Categories & Tags
  categories: () => "categories:all",
  activeCategories: () => "categories:active",
  tags: () => "tags:all",

  // Sales
  salesStats: (userId: string) => `sales-stats:${userId}`,
  recentOrders: (userId: string) => `recent-orders:${userId}`,

  // User
  userProfile: (userId: string) => `user-profile:${userId}`,

  // Payouts
  payoutStats: (userId: string) => `payout-stats:${userId}`,
}

// ─── Pre-built TTL Presets (in seconds) ───────────────────────────────────────

export const cacheTTL = {
  /** 30 seconds — for frequently changing data (order counts, stats) */
  short: 30,
  /** 2 minutes — for moderately changing data (product lists, profiles) */
  medium: 120,
  /** 10 minutes — for rarely changing data (categories, tags) */
  long: 600,
  /** 1 hour — for near-static data (public storefront config) */
  static: 3600,
}
