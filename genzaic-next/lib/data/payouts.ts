import { db, payouts, orders, kyc, users } from "@/lib/db"
import { eq, and, desc, sum, count, or } from "drizzle-orm"

export interface PayoutRow {
  id: string
  amount: string
  status: "pending" | "processing" | "completed" | "failed"
  transactionId: string | null
  utrNumber: string | null
  failureReason: string | null
  processedAt: string | null
  createdAt: string
}

export interface PayoutStats {
  totalEarnings: number
  lifetimeOrders: number
  eligibleRevenue: number
  completedOrders: number
  completedPayouts: number
  pendingPayouts: number
  kycStatus: string
  kycVerified: boolean
  bankAccount: {
    accountHolderName: string
    accountNumber: string
    ifscCode: string
    bankName: string
  } | null
}

// Shared between /api/payouts/stats and the dashboard/payouts RSC prefetch.
export async function getPayoutStatsForUser(userId: string): Promise<PayoutStats> {
  const [
    userRows,
    allOrdersResult,
    completedOrdersResult,
    completedPayoutsResult,
    pendingPayoutsResult,
    kycRecord,
  ] = await Promise.all([
    db
      .select({ kycStatus: users.kycStatus })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1),
    db
      .select({ revenue: sum(orders.subtotal), orderCount: count() })
      .from(orders)
      .where(eq(orders.sellerId, userId)),
    db
      .select({ revenue: sum(orders.subtotal), orderCount: count() })
      .from(orders)
      .where(and(eq(orders.sellerId, userId), eq(orders.status, "completed"))),
    db
      .select({ totalAmount: sum(payouts.amount), totalCount: count() })
      .from(payouts)
      .where(and(eq(payouts.userId, userId), eq(payouts.status, "completed"))),
    db
      .select({ totalAmount: sum(payouts.amount), totalCount: count() })
      .from(payouts)
      .where(
        and(
          eq(payouts.userId, userId),
          or(eq(payouts.status, "pending"), eq(payouts.status, "processing")),
        ),
      ),
    db.select().from(kyc).where(eq(kyc.userId, userId)).limit(1),
  ])

  const kycData = kycRecord[0]
  const kycVerified = kycData?.verificationStatus === "verified"

  return {
    totalEarnings: Number(allOrdersResult[0]?.revenue ?? 0),
    lifetimeOrders: Number(allOrdersResult[0]?.orderCount ?? 0),
    eligibleRevenue: Number(completedOrdersResult[0]?.revenue ?? 0),
    completedOrders: Number(completedOrdersResult[0]?.orderCount ?? 0),
    completedPayouts: Number(completedPayoutsResult[0]?.totalAmount ?? 0),
    pendingPayouts: Number(pendingPayoutsResult[0]?.totalAmount ?? 0),
    kycStatus: userRows[0]?.kycStatus ?? "not_submitted",
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
  }
}

export interface PayoutsListResult {
  payouts: PayoutRow[]
  total: number
}

export async function getPayoutsForUser(
  userId: string,
  opts: { page?: number; limit?: number; status?: string } = {},
): Promise<PayoutsListResult> {
  const page = Math.max(1, opts.page ?? 1)
  const limit = Math.min(100, Math.max(1, opts.limit ?? 10))
  const offset = (page - 1) * limit

  const conditions = [eq(payouts.userId, userId)]
  if (
    opts.status &&
    ["pending", "processing", "completed", "failed"].includes(opts.status)
  ) {
    conditions.push(
      eq(
        payouts.status,
        opts.status as "pending" | "processing" | "completed" | "failed",
      ),
    )
  }
  const whereClause = and(...conditions)

  const [totalResult, rows] = await Promise.all([
    db.select({ count: count() }).from(payouts).where(whereClause),
    db
      .select()
      .from(payouts)
      .where(whereClause)
      .orderBy(desc(payouts.createdAt))
      .limit(limit)
      .offset(offset),
  ])

  return {
    payouts: rows.map((r) => ({
      id: r.id,
      amount: r.amount,
      status: r.status,
      transactionId: r.transactionId ?? null,
      utrNumber: r.utrNumber ?? null,
      failureReason: r.failureReason ?? null,
      processedAt:
        r.processedAt instanceof Date ? r.processedAt.toISOString() : null,
      createdAt:
        r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    })),
    total: Number(totalResult[0]?.count ?? 0),
  }
}
