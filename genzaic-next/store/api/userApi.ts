import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export interface UserProfile {
  id: string
  email: string
  name: string
  avatarUrl?: string | null
  role: string
  isSeller: boolean
  storeUrl?: string | null
  planType: string
  kycStatus: string
  onboardingComplete: boolean
  followersCount: number
  totalProducts: number
  totalSales: number
  totalRevenue: string
  createdAt: string
}

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/user" }),
  tagTypes: ["Profile"],
  endpoints: (builder) => ({
    getProfile: builder.query<UserProfile, void>({
      query: () => "/profile",
      providesTags: ["Profile"],
    }),
    updateProfile: builder.mutation<UserProfile, FormData>({
      query: (body) => ({ url: "/profile", method: "PUT", body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(userApi.util.updateQueryData("getProfile", undefined, () => data))
        } catch {}
      },
      invalidatesTags: ["Profile"],
    }),
    changePassword: builder.mutation<{ message: string }, { currentPassword: string; newPassword: string }>({
      query: (body) => ({ url: "/password", method: "PUT", body }),
    }),
    checkStoreUrl: builder.query<{ available: boolean }, string>({
      query: (storeUrl) => `/check-store-url/${storeUrl}`,
    }),
  }),
})

export const { useGetProfileQuery, useUpdateProfileMutation, useChangePasswordMutation, useLazyCheckStoreUrlQuery } = userApi
