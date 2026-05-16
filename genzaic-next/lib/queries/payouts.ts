"use client"

import { useQuery } from "@tanstack/react-query"
import { getJSON } from "@/lib/react-query/fetcher"

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

export function usePayoutStats() {
  return useQuery({
    queryKey: payoutKeys.stats(),
    queryFn: () => getJSON<PayoutStats>("/api/payouts/stats"),
  })
}

export function usePayouts(filters: { page?: number; limit?: number; status?: string } = {}) {
  return useQuery({
    queryKey: payoutKeys.list(filters),
    queryFn: () => {
      const { page = 1, limit = 10, status } = filters
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (status) params.set("status", status)
      return getJSON<{ payouts: Payout[]; total: number }>(`/api/payouts/?${params}`)
    },
  })
}

/** Fetch a single payout's full detail (UTR, txn id, processedAt, failure reason). */
export function usePayout(id: string | null) {
  return useQuery({
    queryKey: payoutKeys.detail(id ?? ""),
    queryFn: () => getJSON<Payout>(`/api/payouts/${id}`),
    enabled: Boolean(id),
    staleTime: 30_000,
  })
}
