import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, payouts, orders, kyc, users } from "@/lib/db"
import { eq, and, sum, count, or } from "drizzle-orm"

// GET /api/payouts/stats - payout stats including KYC status and bank account info
export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const [user] = await db
      .select({ kycStatus: users.kycStatus })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    const [
      allOrdersResult,
      completedOrdersResult,
      completedPayoutsResult,
      pendingPayoutsResult,
      kycRecord,
    ] = await Promise.all([
      // Lifetime revenue + order count across ALL orders (any status). The
      // dashboard's "X sold" widget reads from the same denominator, so
      // earnings here line up with what the seller sees on the home page.
      db
        .select({ revenue: sum(orders.subtotal), orderCount: count() })
        .from(orders)
        .where(eq(orders.sellerId, userId)),

      // Revenue from COMPLETED orders only — the slice that's actually
      // eligible to enter the payout queue. Surfaced so the seller can see
      // why pending-payout might be zero even when totalEarnings isn't.
      db
        .select({ revenue: sum(orders.subtotal), orderCount: count() })
        .from(orders)
        .where(and(eq(orders.sellerId, userId), eq(orders.status, "completed"))),

      // Total completed payouts (already in the seller's bank)
      db
        .select({ totalAmount: sum(payouts.amount), totalCount: count() })
        .from(payouts)
        .where(and(eq(payouts.userId, userId), eq(payouts.status, "completed"))),

      // Pending + processing payouts (queued, not yet in seller's bank)
      db
        .select({ totalAmount: sum(payouts.amount), totalCount: count() })
        .from(payouts)
        .where(
          and(
            eq(payouts.userId, userId),
            or(eq(payouts.status, "pending"), eq(payouts.status, "processing"))
          )
        ),

      // KYC record for bank account info
      db.select().from(kyc).where(eq(kyc.userId, userId)).limit(1),
    ])

    const kycData = kycRecord[0]
    const kycVerified = kycData?.verificationStatus === "verified"

    const totalEarnings = Number(allOrdersResult[0]?.revenue ?? 0)
    const lifetimeOrders = Number(allOrdersResult[0]?.orderCount ?? 0)
    const eligibleRevenue = Number(completedOrdersResult[0]?.revenue ?? 0)
    const completedOrders = Number(completedOrdersResult[0]?.orderCount ?? 0)
    const completedPayouts = Number(completedPayoutsResult[0]?.totalAmount ?? 0)
    const pendingPayouts = Number(pendingPayoutsResult[0]?.totalAmount ?? 0)

    return NextResponse.json({
      totalEarnings,
      lifetimeOrders,
      eligibleRevenue,
      completedOrders,
      completedPayouts,
      pendingPayouts,
      kycStatus: user?.kycStatus ?? "not_submitted",
      kycVerified,
      bankAccount:
        kycVerified && kycData
          ? {
              accountHolderName: kycData.accountHolderName,
              accountNumber: kycData.accountNumber,
              ifscCode: kycData.ifscCode,
              bankName: kycData.bankName,
            }
          : null,
    })
  } catch (error) {
    console.error("GET /api/payouts/stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
