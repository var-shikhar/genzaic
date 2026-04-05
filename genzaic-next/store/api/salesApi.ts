import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export interface SalesOrder {
  id: string
  productTitle: string
  productThumbnail?: string | null
  buyerName: string
  buyerEmail: string
  buyerPhone?: string | null
  amount: string
  gstAmount: string
  totalAmount: string
  status: "pending" | "completed" | "refunded"
  deliveryType: "download" | "external_link" | "manual"
  deliveryStatus?: "pending" | "delivered" | null
  paymentMethod?: string | null
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

export const salesApi = createApi({
  reducerPath: "salesApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/sales" }),
  tagTypes: ["Sales", "SalesStats"],
  endpoints: (builder) => ({
    getSalesStats: builder.query<SalesStats, void>({
      query: () => "/stats",
      providesTags: ["SalesStats"],
    }),
    getOrders: builder.query<{ orders: SalesOrder[]; total: number }, { page?: number; limit?: number; status?: string; search?: string }>({
      query: ({ page = 1, limit = 10, status, search } = {}) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) })
        if (status) params.set("status", status)
        if (search) params.set("search", search)
        return `/orders?${params}`
      },
      providesTags: ["Sales"],
    }),
    getRecentOrders: builder.query<SalesOrder[], void>({
      query: () => "/orders/recent",
      providesTags: ["Sales"],
    }),
    getOrder: builder.query<SalesOrder, string>({
      query: (id) => `/orders/${id}`,
    }),
    getDownloadLogs: builder.query<any[], { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 } = {}) => `/downloads?page=${page}&limit=${limit}`,
    }),
  }),
})

export const {
  useGetSalesStatsQuery,
  useGetOrdersQuery,
  useGetRecentOrdersQuery,
  useGetOrderQuery,
  useGetDownloadLogsQuery,
} = salesApi
