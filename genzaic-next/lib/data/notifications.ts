import "server-only"
import { and, eq, desc, lt, count } from "drizzle-orm"
import { db, notifications, type Notification } from "@/lib/db"

export interface NotificationsPage {
  items: Notification[]
  nextCursor: string | null
}

export interface NotificationsListOpts {
  cursor?: string | null
  limit?: number
  unread?: boolean
  type?: string
}

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

/**
 * Single source of truth for notification list reads. Used by the GET
 * /api/notifications route and the /notifications RSC prefetch so the
 * client's first render hydrates from cache instead of a roundtrip.
 *
 * Not cached server-side: list pages are user-scoped + read state mutates
 * with every interaction, so TTL caching would mostly serve stale data.
 */
export async function getNotificationsForUser(
  userId: string,
  opts: NotificationsListOpts = {},
): Promise<NotificationsPage> {
  const limit = Math.min(Math.max(1, opts.limit ?? DEFAULT_LIMIT), MAX_LIMIT)

  const filters = [eq(notifications.userId, userId)]
  if (opts.unread) filters.push(eq(notifications.isRead, false))
  if (opts.type) filters.push(eq(notifications.type, opts.type as never))
  if (opts.cursor) {
    const cursorDate = new Date(opts.cursor)
    if (!Number.isNaN(cursorDate.getTime())) {
      filters.push(lt(notifications.createdAt, cursorDate))
    }
  }

  const rows = await db
    .select()
    .from(notifications)
    .where(and(...filters))
    .orderBy(desc(notifications.createdAt))
    .limit(limit + 1)

  const hasMore = rows.length > limit
  const items = hasMore ? rows.slice(0, limit) : rows
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null

  return { items, nextCursor }
}

/**
 * Lightweight unread count for the bell badge. Same query the
 * GET /api/notifications/unread-count route runs.
 */
export async function getUnreadCountForUser(userId: string): Promise<number> {
  const [row] = await db
    .select({ count: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
  return Number(row?.count ?? 0)
}
