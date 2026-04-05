import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export interface ExtractedProduct {
  title: string
  description: string
  price?: number
  originalPrice?: number
  subscriptionDuration?: string
}

export const aiApi = createApi({
  reducerPath: "aiApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/ai" }),
  endpoints: (builder) => ({
    parseProductText: builder.mutation<{ products: ExtractedProduct[]; count: number }, { text: string }>({
      query: (body) => ({ url: "/parse-product-text", method: "POST", body }),
    }),
  }),
})

export const { useParseProductTextMutation } = aiApi
