"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { getJSON, postJSON } from "@/lib/react-query/fetcher"

export interface CheckoutProduct {
  id: string
  title: string
  description?: string | null
  price: string
  originalPrice?: string | null
  thumbnailUrl?: string | null
  deliveryType: "download" | "external_link" | "manual"
  seller: {
    id: string
    name: string
    avatarUrl?: string | null
    storeUrl?: string | null
    storeName?: string | null
  }
  platformFeeMode: "seller" | "buyer"
}

export interface Order {
  id: string
  productTitle: string
  productThumbnail?: string | null
  buyerName: string
  buyerEmail: string
  totalAmount: string
  status: string
  deliveryType: string
  downloadLink?: string | null
  externalUrl?: string | null
  downloadCount: number
  maxDownloads: number
  createdAt: string
}

export const checkoutKeys = {
  all: ["checkout"] as const,
  product: (id: string) => [...checkoutKeys.all, "product", id] as const,
  order: (id: string) => [...checkoutKeys.all, "order", id] as const,
} as const

export function useCheckoutProduct(productId: string) {
  return useQuery({
    queryKey: checkoutKeys.product(productId),
    queryFn: () => getJSON<CheckoutProduct>(`/api/checkout/product/${productId}`),
    enabled: Boolean(productId),
  })
}

export interface CreateOrderInput {
  productId: string
  buyerName: string
  buyerEmail: string
  buyerPhone?: string
  buyerGstin?: string
  paymentMethod?: string
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: (input: CreateOrderInput) => postJSON<CreateOrderInput, Order>("/api/checkout/create-order", input),
  })
}

export function useOrderForDownload(orderId: string) {
  return useQuery({
    queryKey: checkoutKeys.order(orderId),
    queryFn: () => getJSON<Order>(`/api/checkout/order/${orderId}`),
    enabled: Boolean(orderId),
  })
}

export function useRecordDownload() {
  return useMutation({
    mutationFn: (orderId: string) =>
      postJSON<{ orderId: string }, void>("/api/checkout/record-download", { orderId }),
  })
}
