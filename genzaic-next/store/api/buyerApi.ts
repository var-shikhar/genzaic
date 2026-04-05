import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

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

export const buyerApi = createApi({
  reducerPath: "buyerApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/buyer" }),
  tagTypes: ["BuyerOrder"],
  endpoints: (builder) => ({
    getMyOrders: builder.query<BuyerOrder[], void>({
      query: () => "/orders",
      providesTags: ["BuyerOrder"],
    }),
    getMyOrder: builder.query<BuyerOrder, string>({
      query: (orderId) => `/orders/${orderId}`,
      providesTags: (_, __, id) => [{ type: "BuyerOrder", id }],
    }),
    linkOrders: builder.mutation<void, { email: string }>({
      query: (body) => ({ url: "/link-orders", method: "POST", body }),
      invalidatesTags: ["BuyerOrder"],
    }),
  }),
})

export const { useGetMyOrdersQuery, useGetMyOrderQuery, useLinkOrdersMutation } = buyerApi
