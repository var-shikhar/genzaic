import { NextRequest, NextResponse } from "next/server"
import { and, eq, desc, lt } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db, notifications } from "@/lib/db"

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id as string

  const url = new URL(req.url)
  const cursor = url.searchParams.get("cursor")
  const limit = Math.min(
    Math.max(1, Number(url.searchParams.get("limit") ?? DEFAULT_LIMIT)),
    MAX_LIMIT,
  )
  const unreadOnly = url.searchParams.get("unread") === "true"
  const typeFilter = url.searchParams.get("type")

  const filters = [eq(notifications.userId, userId)]
  if (unreadOnly) filters.push(eq(notifications.isRead, false))
  if (typeFilter) filters.push(eq(notifications.type, typeFilter as never))
  if (cursor) {
    const cursorDate = new Date(cursor)
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

  return NextResponse.json({ items, nextCursor })
}
