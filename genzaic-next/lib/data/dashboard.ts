import { db, products, orders } from "@/lib/db"
import { eq, and, sum, count, gte, lt, desc } from "drizzle-orm"
import { startOfMonth, subMonths } from "date-fns"
import { getStorefrontByUser } from "@/lib/db/storefront-helpers"
import { cache, cacheKeys, cacheTTL } from "@/lib/cache"

export interface ProductStats {
  totalProducts: number
  activeProducts: number
  totalDownloads: number
  totalViews: number
}

export interface SalesStats {
  totalRevenue: number
  totalOrders: number
  completedOrders: number
  pendingAmount: number
  monthlyRevenue: number
  salesChange: string
}

export interface DashboardProductsList {
  products: (typeof products.$inferSelect)[]
  total: number
  page: number
  limit: number
}

// Single source of truth shared between the GET /api/products/stats route and
// the dashboard RSC's server-side prefetch.
export async function getProductStatsForUser(userId: string): Promise<ProductStats> {
  const storefront = await getStorefrontByUser(userId)
  if (!storefront) {
    return { totalProducts: 0, activeProducts: 0, totalDownloads: 0, totalViews: 0 }
  }
  return cache.getOrSet(
    cacheKeys.productStats(storefront.id),
    async () => {
      const [all, active, aggregates] = await Promise.all([
        db
          .select({ count: count() })
          .from(products)
          .where(eq(products.storefrontId, storefront.id)),
        db
          .select({ count: count() })
          .from(products)
          .where(and(eq(products.storefrontId, storefront.id), eq(products.isActive, true))),
        db
          .select({
            totalDownloads: sum(products.downloads),
            totalViews: sum(products.views),
          })
          .from(products)
          .where(eq(products.storefrontId, storefront.id)),
      ])
      return {
        totalProducts: Number(all[0]?.count ?? 0),
        activeProducts: Number(active[0]?.count ?? 0),
        totalDownloads: Number(aggregates[0]?.totalDownloads ?? 0),
        totalViews: Number(aggregates[0]?.totalViews ?? 0),
      }
    },
    { ttl: cacheTTL.short, tags: ["products", `storefront:${storefront.id}`] },
  )
}

// Single source of truth shared between the GET /api/sales/stats route and
// the dashboard RSC's server-side prefetch.
export async function getSalesStatsForUser(userId: string): Promise<SalesStats> {
  return cache.getOrSet(
    cacheKeys.salesStats(userId),
    async () => {
      const now = new Date()
      const thisMonthStart = startOfMonth(now)
      const lastMonthStart = startOfMonth(subMonths(now, 1))

      const [allOrders, completedOrders, thisMonthOrders, lastMonthOrders] = await Promise.all([
        db
          .select({ total: count(), totalRevenue: sum(orders.subtotal) })
          .from(orders)
          .where(eq(orders.sellerId, userId)),
        db
          .select({ total: count(), totalRevenue: sum(orders.subtotal) })
          .from(orders)
          .where(and(eq(orders.sellerId, userId), eq(orders.status, "completed"))),
        db
          .select({ total: count(), totalRevenue: sum(orders.subtotal) })
          .from(orders)
          .where(
            and(
              eq(orders.sellerId, userId),
              eq(orders.status, "completed"),
              gte(orders.createdAt, thisMonthStart),
            ),
          ),
        db
          .select({ total: count(), totalRevenue: sum(orders.subtotal) })
          .from(orders)
          .where(
            and(
              eq(orders.sellerId, userId),
              eq(orders.status, "completed"),
              gte(orders.createdAt, lastMonthStart),
              lt(orders.createdAt, thisMonthStart),
            ),
          ),
      ])

      const totalRevenue = Number(completedOrders[0]?.totalRevenue ?? 0)
      const totalOrders = Number(allOrders[0]?.total ?? 0)
      const completedCount = Number(completedOrders[0]?.total ?? 0)
      const monthlyRevenue = Number(thisMonthOrders[0]?.totalRevenue ?? 0)
      const lastMonthRevenue = Number(lastMonthOrders[0]?.totalRevenue ?? 0)
      const pendingAmount = Math.max(
        0,
        Number(allOrders[0]?.totalRevenue ?? 0) - totalRevenue,
      )
      const salesChange =
        lastMonthRevenue > 0
          ? (((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
          : monthlyRevenue > 0
            ? "100.0"
            : "0.0"

      return {
        totalRevenue,
        totalOrders,
        completedOrders: completedCount,
        pendingAmount,
        monthlyRevenue,
        salesChange,
      }
    },
    { ttl: cacheTTL.short, tags: ["sales", `user:${userId}`] },
  )
}

/**
 * Trimmed products list used by the dashboard RSC prefetch. Mirrors what
 * GET /api/products returns for the default unfiltered case so the seeded
 * cache key matches what useProducts({ page, limit }) would fetch.
 */
export async function getProductsListForUser(
  userId: string,
  opts: { page: number; limit: number },
): Promise<DashboardProductsList> {
  const storefront = await getStorefrontByUser(userId)
  if (!storefront) {
    return { products: [], total: 0, page: opts.page, limit: opts.limit }
  }
  const offset = (opts.page - 1) * opts.limit
  const whereClause = eq(products.storefrontId, storefront.id)
  const [totalResult, rows] = await Promise.all([
    db.select({ count: count() }).from(products).where(whereClause),
    db
      .select()
      .from(products)
      .where(whereClause)
      .orderBy(desc(products.createdAt))
      .limit(opts.limit)
      .offset(offset),
  ])
  return {
    products: rows,
    total: Number(totalResult[0]?.count ?? 0),
    page: opts.page,
    limit: opts.limit,
  }
}
