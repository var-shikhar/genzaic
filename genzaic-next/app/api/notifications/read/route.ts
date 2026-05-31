import { NextRequest, NextResponse } from "next/server"
import { and, eq, inArray } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db, notifications } from "@/lib/db"
import { markNotificationsReadSchema } from "@/lib/validations/notification"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id as string

  const parsed = markNotificationsReadSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(
      and(
        eq(notifications.userId, userId),
        inArray(notifications.id, parsed.data.notificationIds),
      ),
    )

  return NextResponse.json({ ok: true })
}
