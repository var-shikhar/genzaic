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
  totalEarnings: number
  completedPayouts: number
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
