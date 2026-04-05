import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

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

export const payoutsApi = createApi({
  reducerPath: "payoutsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/payouts" }),
  tagTypes: ["Payout", "PayoutStats"],
  endpoints: (builder) => ({
    getPayoutStats: builder.query<PayoutStats, void>({
      query: () => "/stats",
      providesTags: ["PayoutStats"],
    }),
    getPayouts: builder.query<{ payouts: Payout[]; total: number }, { page?: number; limit?: number; status?: string }>({
      query: ({ page = 1, limit = 10, status } = {}) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) })
        if (status) params.set("status", status)
        return `/?${params}`
      },
      providesTags: ["Payout"],
    }),
    getPayout: builder.query<Payout, string>({
      query: (id) => `/${id}`,
    }),
  }),
})

export const { useGetPayoutStatsQuery, useGetPayoutsQuery, useGetPayoutQuery } = payoutsApi
