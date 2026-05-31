import { NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db, userDevices } from "@/lib/db"
import {
  registerDeviceSchema,
  unregisterDeviceSchema,
} from "@/lib/validations/notification"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id as string

  const parsed = registerDeviceSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  await db
    .insert(userDevices)
    .values({
      userId,
      fcmToken: parsed.data.fcmToken,
      userAgent: parsed.data.userAgent,
      lastSeenAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userDevices.fcmToken,
      set: { userId, lastSeenAt: new Date(), userAgent: parsed.data.userAgent },
    })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id as string

  const parsed = unregisterDeviceSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  await db
    .delete(userDevices)
    .where(
      and(
        eq(userDevices.userId, userId),
        eq(userDevices.fcmToken, parsed.data.fcmToken),
      ),
    )

  return NextResponse.json({ ok: true })
}
