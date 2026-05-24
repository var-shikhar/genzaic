import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDownloadLogsForUser } from "@/lib/data/sales"

// GET /api/sales/downloads — thin wrapper around the shared helper.
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const { searchParams } = new URL(req.url)
    const result = await getDownloadLogsForUser(userId, {
      page: Number(searchParams.get("page") ?? "1"),
      limit: Number(searchParams.get("limit") ?? "10"),
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("GET /api/sales/downloads error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
