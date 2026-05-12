import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, payouts } from "@/lib/db"
import { and, eq } from "drizzle-orm"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type RouteContext = { params: Promise<{ id: string }> }

// GET /api/payouts/[id] — fetch a single payout belonging to the authenticated
// seller. Ownership is enforced by `payouts.userId === session.user.id` —
// payouts belonging to other sellers return 404 (not 403) so we don't leak
// existence.
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id as string

    const { id } = await params
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: "Payout not found" }, { status: 404 })
    }

    const [row] = await db
      .select()
      .from(payouts)
      .where(and(eq(payouts.id, id), eq(payouts.userId, userId)))
      .limit(1)

    if (!row) {
      return NextResponse.json({ error: "Payout not found" }, { status: 404 })
    }

    return NextResponse.json(row)
  } catch (error) {
    console.error("GET /api/payouts/[id] error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
