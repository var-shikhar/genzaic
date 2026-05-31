// Shared query keys + types for sales. See products-keys.ts for the
// rationale — server components must import keys from outside the
// "use client" boundary or they get a client-reference stub instead of
// the real factory functions.

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
