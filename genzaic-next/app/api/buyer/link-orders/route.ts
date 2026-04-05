import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, orders, users } from "@/lib/db"
import { eq, and, isNull } from "drizzle-orm"

// POST /api/buyer/link-orders
// Links guest orders (buyerId is null) that match the authenticated user's email
export async function POST(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    // Find unlinked guest orders matching this user's email
    const unlinked = await db
      .select({ id: orders.id })
      .from(orders)
      .where(and(eq(orders.buyerEmail, user.email), isNull(orders.buyerId)))

    if (unlinked.length === 0) {
      return NextResponse.json({ linked: 0, message: "No unlinked orders found" })
    }

    // Link them to the authenticated user
    await db
      .update(orders)
      .set({ buyerId: userId, updatedAt: new Date() })
      .where(and(eq(orders.buyerEmail, user.email), isNull(orders.buyerId)))

    return NextResponse.json({ linked: unlinked.length, message: `${unlinked.length} order(s) linked to your account` })
  } catch (error) {
    console.error("POST /api/buyer/link-orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
