import { NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db, notificationPreferences } from "@/lib/db"
import { updateNotificationPreferenceSchema } from "@/lib/validations/notification"

export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id as string

  const rows = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))

  return NextResponse.json(rows)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id as string

  const parsed = updateNotificationPreferenceSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { notificationType, inAppEnabled, emailEnabled } = parsed.data

  const existing = await db
    .select()
    .from(notificationPreferences)
    .where(
      and(
        eq(notificationPreferences.userId, userId),
        eq(notificationPreferences.notificationType, notificationType),
      ),
    )
    .limit(1)

  if (existing.length > 0) {
    const [updated] = await db
      .update(notificationPreferences)
      .set({ inAppEnabled, emailEnabled, updatedAt: new Date() })
      .where(eq(notificationPreferences.id, existing[0].id))
      .returning()
    return NextResponse.json(updated)
  }

  const [created] = await db
    .insert(notificationPreferences)
    .values({ userId, notificationType, inAppEnabled, emailEnabled })
    .returning()
  return NextResponse.json(created)
}
