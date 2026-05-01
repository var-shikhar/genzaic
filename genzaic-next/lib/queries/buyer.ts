"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getJSON, postJSON } from "@/lib/react-query/fetcher"

export interface BuyerOrder {
  id: string
  productId: string
  productTitle: string
  productThumbnail?: string | null
  productDescription?: string | null
  sellerName: string
  sellerStoreUrl?: string | null
  sellerEmail?: string | null
  sellerPhone?: string | null
  sellerWhatsapp?: string | null
  totalAmount: string
  purchasedAt: string
  downloadCount: number
  maxDownloads: number
  downloadLink?: string | null
  deliveryType: "download" | "external_link" | "manual"
  externalUrl?: string | null
  deliveryStatus?: "pending" | "delivered" | null
}

export const buyerKeys = {
  all: ["buyer"] as const,
  orders: () => [...buyerKeys.all, "orders"] as const,
  order: (id: string) => [...buyerKeys.orders(), id] as const,
} as const

export function useMyOrders() {
  return useQuery({
    queryKey: buyerKeys.orders(),
    queryFn: () => getJSON<BuyerOrder[]>("/api/buyer/orders"),
  })
}

export function useMyOrder(orderId: string) {
  return useQuery({
    queryKey: buyerKeys.order(orderId),
    queryFn: () => getJSON<BuyerOrder>(`/api/buyer/orders/${orderId}`),
    enabled: Boolean(orderId),
  })
}

export function useLinkOrders() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { email: string }) => postJSON<typeof input, void>("/api/buyer/link-orders", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: buyerKeys.orders() }),
  })
}
