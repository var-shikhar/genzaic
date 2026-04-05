import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export interface Storefront {
  id: string
  userId: string
  storeUrl?: string | null
  storeName?: string | null
  description?: string | null
  profileImageUrl?: string | null
  coverImageUrl?: string | null
  tagline?: string | null
  themeId: string
  primaryColor: string
  fontFamily: string
  isPublished: boolean
  platformFeeMode: "seller" | "buyer"
  upiId?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  contactWhatsapp?: string | null
  socialInstagram?: string | null
  socialTwitter?: string | null
  socialYoutube?: string | null
  socialWebsite?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string | null
  createdAt: string
  updatedAt: string
}

export const storefrontApi = createApi({
  reducerPath: "storefrontApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Storefront"],
  endpoints: (builder) => ({
    getStorefront: builder.query<Storefront, void>({
      query: () => "/storefront",
      providesTags: ["Storefront"],
    }),
    getPublicStorefront: builder.query<Storefront & { products: any[] }, string>({
      query: (slug) => `/storefront/public/${slug}`,
    }),
    updateStorefront: builder.mutation<Storefront, FormData>({
      query: (body) => ({ url: "/storefront", method: "PUT", body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(storefrontApi.util.updateQueryData("getStorefront", undefined, () => data))
        } catch {}
      },
      invalidatesTags: ["Storefront"],
    }),
    togglePublish: builder.mutation<{ isPublished: boolean }, void>({
      query: () => ({ url: "/storefront/toggle-publish", method: "PATCH" }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(
            storefrontApi.util.updateQueryData("getStorefront", undefined, (draft) => {
              draft.isPublished = data.isPublished
            })
          )
        } catch {}
      },
      invalidatesTags: ["Storefront"],
    }),
    checkSlug: builder.query<{ available: boolean }, string>({
      query: (slug) => `/storefront/check-slug/${slug}`,
    }),
    getStorefrontStats: builder.query<{ totalViews: number; totalRevenue: string; totalOrders: number }, void>({
      query: () => "/storefront/stats",
    }),
  }),
})

export const {
  useGetStorefrontQuery,
  useGetPublicStorefrontQuery,
  useUpdateStorefrontMutation,
  useTogglePublishMutation,
  useLazyCheckSlugQuery,
  useGetStorefrontStatsQuery,
} = storefrontApi
