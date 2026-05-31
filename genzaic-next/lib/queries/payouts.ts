"use client"

import { useQuery } from "@tanstack/react-query"
import { getJSON } from "@/lib/react-query/fetcher"
import { payoutKeys, type Payout, type PayoutStats } from "./payouts-keys"

// Re-export so existing `from "@/lib/queries/payouts"` imports keep working.
// Server components should import from "@/lib/queries/payouts-keys" directly.
export { payoutKeys }
export type { Payout, PayoutStats }

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
