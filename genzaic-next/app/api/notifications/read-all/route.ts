import { NextRequest, NextResponse } from "next/server"
import { and, eq, lte } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db, notifications } from "@/lib/db"
import { markAllReadSchema } from "@/lib/validations/notification"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id as string

  const body =
    req.headers.get("content-length") === "0" ? {} : await req.json().catch(() => ({}))
  const parsed = markAllReadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const filters = [
    eq(notifications.userId, userId),
    eq(notifications.isRead, false),
  ]
  if (parsed.data.beforeDate) {
    filters.push(lte(notifications.createdAt, parsed.data.beforeDate))
  }

  const updated = await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(...filters))
    .returning({ id: notifications.id })

  return NextResponse.json({ ok: true, updated: updated.length })
}
