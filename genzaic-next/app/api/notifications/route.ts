import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getNotificationsForUser } from "@/lib/data/notifications"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id as string

  const url = new URL(req.url)
  const page = await getNotificationsForUser(userId, {
    cursor: url.searchParams.get("cursor"),
    limit: url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined,
    unread: url.searchParams.get("unread") === "true",
    type: url.searchParams.get("type") ?? undefined,
  })

  return NextResponse.json(page)
}
