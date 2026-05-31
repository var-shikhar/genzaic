// Shared query keys + types for payouts. See products-keys.ts for the
// rationale — server components must import keys from outside the
// "use client" boundary or they get a client-reference stub instead of
// the real factory functions (e.g. `payoutKeys.stats is not a function`).

export interface Payout {
  id: string
  amount: string
  status: "pending" | "processing" | "completed" | "failed"
  transactionId?: string | null
  utrNumber?: string | null
  failureReason?: string | null
  processedAt?: string | null
  createdAt: string
}

export interface PayoutStats {
  /** Revenue from ALL orders (any status). Mirrors the dashboard's lifetime
   *  sales number so the two pages don't disagree. */
  totalEarnings: number
  /** Count of all orders contributing to totalEarnings. */
  lifetimeOrders: number
  /** Revenue from orders with status='completed' — the slice that's actually
   *  eligible to enter the payout queue. */
  eligibleRevenue: number
  completedOrders: number
  /** Sum of payout rows with status='completed' (money already in seller's bank). */
  completedPayouts: number
  /** Sum of payout rows with status in ('pending', 'processing'). */
  pendingPayouts: number
  kycStatus: string
  kycVerified: boolean
  bankAccount?: {
    accountHolderName: string
    accountNumber: string
    ifscCode: string
    bankName: string
  } | null
}

export const payoutKeys = {
  all: ["payouts"] as const,
  stats: () => [...payoutKeys.all, "stats"] as const,
  lists: () => [...payoutKeys.all, "list"] as const,
  list: (filters: { page?: number; limit?: number; status?: string }) =>
    [...payoutKeys.lists(), filters] as const,
  details: () => [...payoutKeys.all, "detail"] as const,
  detail: (id: string) => [...payoutKeys.details(), id] as const,
} as const
