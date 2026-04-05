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

    const [earningsResult, completedPayoutsResult, pendingPayoutsResult, kycRecord] = await Promise.all([
      // Total earnings from completed orders (use subtotal instead of old amount)
      db
        .select({ totalEarnings: sum(orders.subtotal) })
        .from(orders)
        .where(and(eq(orders.sellerId, userId), eq(orders.status, "completed"))),

      // Total completed payouts
      db
        .select({ totalAmount: sum(payouts.amount), totalCount: count() })
        .from(payouts)
        .where(and(eq(payouts.userId, userId), eq(payouts.status, "completed"))),

      // Pending + processing payouts
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

    return NextResponse.json({
      totalEarnings: Number(earningsResult[0]?.totalEarnings ?? 0),
      completedPayouts: Number(completedPayoutsResult[0]?.totalAmount ?? 0),
      pendingPayouts: Number(pendingPayoutsResult[0]?.totalAmount ?? 0),
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
