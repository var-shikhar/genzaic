import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

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

export const checkoutApi = createApi({
  reducerPath: "checkoutApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/checkout" }),
  endpoints: (builder) => ({
    getCheckoutProduct: builder.query<CheckoutProduct, string>({
      query: (productId) => `/product/${productId}`,
    }),
    createOrder: builder.mutation<Order, { productId: string; buyerName: string; buyerEmail: string; buyerPhone?: string; buyerGstin?: string; paymentMethod?: string }>({
      query: (body) => ({ url: "/create-order", method: "POST", body }),
    }),
    getOrderForDownload: builder.query<Order, string>({
      query: (orderId) => `/order/${orderId}`,
    }),
    recordDownload: builder.mutation<void, string>({
      query: (orderId) => ({ url: "/record-download", method: "POST", body: { orderId } }),
    }),
  }),
})

export const {
  useGetCheckoutProductQuery,
  useCreateOrderMutation,
  useGetOrderForDownloadQuery,
  useRecordDownloadMutation,
} = checkoutApi
