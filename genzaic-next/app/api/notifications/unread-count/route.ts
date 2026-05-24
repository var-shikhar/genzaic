import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getUnreadCountForUser } from "@/lib/data/notifications"

export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id as string

  const count = await getUnreadCountForUser(userId)
  return NextResponse.json({ count })
}
