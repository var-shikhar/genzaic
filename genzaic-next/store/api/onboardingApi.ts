import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const onboardingApi = createApi({
  reducerPath: "onboardingApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/onboarding" }),
  endpoints: (builder) => ({
    getOnboardingStatus: builder.query<{ complete: boolean; step: number }, void>({
      query: () => "/status",
    }),
    selectPlan: builder.mutation<any, { plan: string }>({
      query: (body) => ({ url: "/plan", method: "POST", body }),
    }),
    completeOnboarding: builder.mutation<any, void>({
      query: () => ({ url: "/complete", method: "POST" }),
    }),
    skipOnboarding: builder.mutation<any, void>({
      query: () => ({ url: "/skip", method: "POST" }),
    }),
  }),
})

export const {
  useGetOnboardingStatusQuery,
  useSelectPlanMutation,
  useCompleteOnboardingMutation,
  useSkipOnboardingMutation,
} = onboardingApi
