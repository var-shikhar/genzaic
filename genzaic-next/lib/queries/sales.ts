"use client"

import { useQuery } from "@tanstack/react-query"
import { getJSON } from "@/lib/react-query/fetcher"

export interface SalesOrder {
  id: string
  orderNumber: string
  productTitle: string
  productThumbnail?: string | null
  buyerName: string
  buyerEmail: string
  buyerPhone?: string | null
  subtotal: string
  gstAmount: string
  totalAmount: string
  status: "pending" | "completed"
  deliveryType: "download" | "external_link" | "manual"
  deliveryStatus?: "pending" | "delivered" | null
  downloadCount: number
  createdAt: string
}

export interface SalesStats {
  totalRevenue: number
  totalOrders: number
  completedOrders: number
  pendingAmount: number
  monthlyRevenue: number
  salesChange?: string
  ordersChange?: string
}

export interface DownloadLog {
  id: string
  productTitle: string
  buyerName: string
  buyerEmail: string
  downloadedAt: string
  ipAddress?: string | null
}

export const salesKeys = {
  all: ["sales"] as const,
  stats: () => [...salesKeys.all, "stats"] as const,
  orders: () => [...salesKeys.all, "orders"] as const,
  ordersList: (filters: { page?: number; limit?: number; status?: string; search?: string }) =>
    [...salesKeys.orders(), filters] as const,
  recent: () => [...salesKeys.orders(), "recent"] as const,
  detail: (id: string) => [...salesKeys.orders(), "detail", id] as const,
  downloads: () => [...salesKeys.all, "downloads"] as const,
  downloadList: (filters: { page?: number; limit?: number }) =>
    [...salesKeys.downloads(), filters] as const,
} as const

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
