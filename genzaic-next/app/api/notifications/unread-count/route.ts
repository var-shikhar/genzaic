import { NextRequest, NextResponse } from "next/server"
import { and, eq, count } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db, notifications } from "@/lib/db"

export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id as string

  const [row] = await db
    .select({ count: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))

  return NextResponse.json({ count: Number(row?.count ?? 0) })
}
