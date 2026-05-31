"use client"

import { useQuery } from "@tanstack/react-query"
import { getJSON } from "@/lib/react-query/fetcher"
import {
  salesKeys,
  type SalesOrder,
  type SalesStats,
  type DownloadLog,
} from "./sales-keys"

// Re-export so existing `from "@/lib/queries/sales"` imports keep working.
// Server components should import from "@/lib/queries/sales-keys" directly.
export { salesKeys }
export type { SalesOrder, SalesStats, DownloadLog }

export function useSalesStats() {
  return useQuery({
    queryKey: salesKeys.stats(),
    queryFn: () => getJSON<SalesStats>("/api/sales/stats"),
  })
}

export function useOrders(filters: { page?: number; limit?: number; status?: string; search?: string } = {}) {
  return useQuery({
    queryKey: salesKeys.ordersList(filters),
    queryFn: () => {
      const { page = 1, limit = 10, status, search } = filters
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (status) params.set("status", status)
      if (search) params.set("search", search)
      return getJSON<{ orders: SalesOrder[]; total: number }>(`/api/sales/orders?${params}`)
    },
  })
}

export function useRecentOrders() {
  return useQuery({
    queryKey: salesKeys.recent(),
    queryFn: () => getJSON<SalesOrder[]>("/api/sales/orders/recent"),
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: salesKeys.detail(id),
    queryFn: () => getJSON<SalesOrder>(`/api/sales/orders/${id}`),
    enabled: Boolean(id),
  })
}

export function useDownloadLogs(filters: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: salesKeys.downloadList(filters),
    queryFn: () => {
      const { page = 1, limit = 10 } = filters
      return getJSON<{ logs: DownloadLog[]; total: number }>(`/api/sales/downloads?page=${page}&limit=${limit}`)
    },
  })
}
