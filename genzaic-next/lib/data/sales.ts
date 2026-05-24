import { db, orders, orderItems, downloadLogs } from "@/lib/db"
import { eq, and, desc, ilike, or, count, inArray } from "drizzle-orm"

// Shared between /api/sales/orders, /api/sales/orders/recent,
// /api/sales/downloads, and the dashboard/sales RSC's server-side prefetch.
// Mirrors the existing route responses 1:1 so the seeded TanStack cache key
// hits exactly when the client-side useOrders / useRecentOrders /
// useDownloadLogs hooks fire on first render.

export interface SalesOrderRow {
  id: string
  orderNumber: string
  productTitle: string
  productThumbnail: string | null
  buyerName: string
  buyerEmail: string
  buyerPhone: string | null
  subtotal: string
  gstAmount: string
  totalAmount: string
  status: "pending" | "completed"
  deliveryType: "download" | "external_link" | "manual"
  deliveryStatus: "pending" | "delivered" | null
  downloadCount: number
  createdAt: string
}

export interface OrdersListResult {
  orders: SalesOrderRow[]
  total: number
  page: number
  limit: number
}

export async function getOrdersForUser(
  userId: string,
  opts: {
    page?: number
    limit?: number
    status?: string
    search?: string
  } = {},
): Promise<OrdersListResult> {
  const page = Math.max(1, opts.page ?? 1)
  const limit = Math.min(100, Math.max(1, opts.limit ?? 10))
  const offset = (page - 1) * limit
  const search = opts.search ?? ""
  const status = opts.status ?? ""

  const conditions = [eq(orders.sellerId, userId)]
  if (status && ["pending", "completed", "refunded"].includes(status)) {
    conditions.push(eq(orders.status, status as "pending" | "completed"))
  }
  if (search) {
    conditions.push(
      or(
        ilike(orders.buyerName, `%${search}%`),
        ilike(orders.buyerEmail, `%${search}%`),
      )!,
    )
  }
  const whereClause = and(...conditions)

  const [totalResult, rows] = await Promise.all([
    db.select({ count: count() }).from(orders).where(whereClause),
    db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        buyerName: orders.buyerName,
        buyerEmail: orders.buyerEmail,
        buyerPhone: orders.buyerPhone,
        subtotal: orders.subtotal,
        gstAmount: orders.gstAmount,
        totalAmount: orders.totalAmount,
        status: orders.status,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(whereClause)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset),
  ])

  // Batch-fetch one item per order in a single query (replaces the prior
  // N+1 — same pattern as /api/sales/orders).
  const orderIdsInPage = rows.map((r) => r.id)
  const itemsForPage = orderIdsInPage.length
    ? await db
        .select({
          orderId: orderItems.orderId,
          productTitle: orderItems.productTitle,
          productThumbnail: orderItems.productThumbnail,
          deliveryType: orderItems.deliveryType,
          deliveryStatus: orderItems.deliveryStatus,
          downloadCount: orderItems.downloadCount,
        })
        .from(orderItems)
        .where(inArray(orderItems.orderId, orderIdsInPage))
    : []

  const firstItemByOrderId = new Map<string, (typeof itemsForPage)[number]>()
  for (const item of itemsForPage) {
    if (!firstItemByOrderId.has(item.orderId)) {
      firstItemByOrderId.set(item.orderId, item)
    }
  }

  const enriched: SalesOrderRow[] = rows.map((row) => {
    const firstItem = firstItemByOrderId.get(row.id) ?? null
    return {
      id: row.id,
      orderNumber: row.orderNumber,
      buyerName: row.buyerName,
      buyerEmail: row.buyerEmail,
      buyerPhone: row.buyerPhone ?? null,
      subtotal: row.subtotal,
      gstAmount: row.gstAmount,
      totalAmount: row.totalAmount,
      status: row.status,
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
      productTitle: firstItem?.productTitle ?? "Unknown",
      productThumbnail: firstItem?.productThumbnail ?? null,
      deliveryType: firstItem?.deliveryType ?? "download",
      deliveryStatus: firstItem?.deliveryStatus ?? null,
      downloadCount: firstItem?.downloadCount ?? 0,
    }
  })

  return {
    orders: enriched,
    total: Number(totalResult[0]?.count ?? 0),
    page,
    limit,
  }
}

export async function getRecentOrdersForUser(userId: string): Promise<SalesOrderRow[]> {
  const recentOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      buyerName: orders.buyerName,
      buyerEmail: orders.buyerEmail,
      buyerPhone: orders.buyerPhone,
      subtotal: orders.subtotal,
      gstAmount: orders.gstAmount,
      totalAmount: orders.totalAmount,
      status: orders.status,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.sellerId, userId))
    .orderBy(desc(orders.createdAt))
    .limit(5)

  if (recentOrders.length === 0) return []

  const orderIds = recentOrders.map((o) => o.id)
  const itemsForOrders = await db
    .select({
      orderId: orderItems.orderId,
      productTitle: orderItems.productTitle,
      productThumbnail: orderItems.productThumbnail,
      deliveryType: orderItems.deliveryType,
      deliveryStatus: orderItems.deliveryStatus,
      downloadCount: orderItems.downloadCount,
    })
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds))

  const firstItemByOrderId = new Map<string, (typeof itemsForOrders)[number]>()
  for (const item of itemsForOrders) {
    if (!firstItemByOrderId.has(item.orderId)) {
      firstItemByOrderId.set(item.orderId, item)
    }
  }

  return recentOrders.map((row) => {
    const firstItem = firstItemByOrderId.get(row.id) ?? null
    return {
      id: row.id,
      orderNumber: row.orderNumber,
      buyerName: row.buyerName,
      buyerEmail: row.buyerEmail,
      buyerPhone: row.buyerPhone ?? null,
      subtotal: row.subtotal,
      gstAmount: row.gstAmount,
      totalAmount: row.totalAmount,
      status: row.status,
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
      productTitle: firstItem?.productTitle ?? "Unknown",
      productThumbnail: firstItem?.productThumbnail ?? null,
      deliveryType: firstItem?.deliveryType ?? "download",
      deliveryStatus: firstItem?.deliveryStatus ?? null,
      downloadCount: firstItem?.downloadCount ?? 0,
    }
  })
}

export interface DownloadLogRow {
  id: string
  orderItemId: string
  productTitle: string
  buyerName: string
  buyerEmail: string
  ipAddress: string | null
  downloadedAt: string
}

export interface DownloadLogsListResult {
  logs: DownloadLogRow[]
  total: number
  page: number
  limit: number
}

export async function getDownloadLogsForUser(
  userId: string,
  opts: { page?: number; limit?: number } = {},
): Promise<DownloadLogsListResult> {
  const page = Math.max(1, opts.page ?? 1)
  const limit = Math.min(100, Math.max(1, opts.limit ?? 10))
  const offset = (page - 1) * limit

  const ownership = eq(orders.sellerId, userId)

  const [totalResult, logs] = await Promise.all([
    db
      .select({ count: count() })
      .from(downloadLogs)
      .innerJoin(orderItems, eq(orderItems.id, downloadLogs.orderItemId))
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(ownership),
    db
      .select({
        id: downloadLogs.id,
        orderItemId: downloadLogs.orderItemId,
        productTitle: downloadLogs.productTitle,
        buyerName: downloadLogs.buyerName,
        buyerEmail: downloadLogs.buyerEmail,
        ipAddress: downloadLogs.ipAddress,
        downloadedAt: downloadLogs.downloadedAt,
      })
      .from(downloadLogs)
      .innerJoin(orderItems, eq(orderItems.id, downloadLogs.orderItemId))
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(ownership)
      .orderBy(desc(downloadLogs.downloadedAt))
      .limit(limit)
      .offset(offset),
  ])

  return {
    logs: logs.map((l) => ({
      id: l.id,
      orderItemId: l.orderItemId,
      productTitle: l.productTitle,
      buyerName: l.buyerName,
      buyerEmail: l.buyerEmail,
      ipAddress: l.ipAddress ?? null,
      downloadedAt:
        l.downloadedAt instanceof Date ? l.downloadedAt.toISOString() : String(l.downloadedAt),
    })),
    total: Number(totalResult[0]?.count ?? 0),
    page,
    limit,
  }
}
