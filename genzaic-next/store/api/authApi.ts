import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/auth" }),
  endpoints: (builder) => ({
    signup: builder.mutation<{ message: string; email: string }, { name: string; email: string; password: string; role: string }>({
      query: (body) => ({ url: "/signup", method: "POST", body }),
    }),
    verifyOTP: builder.mutation<{ success: boolean }, { email: string; otp: string }>({
      query: (body) => ({ url: "/verify-email", method: "POST", body }),
    }),
    resendOTP: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: "/resend-otp", method: "POST", body }),
    }),
    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: "/forgot-password", method: "POST", body }),
    }),
    resetPassword: builder.mutation<{ message: string }, { token: string; password: string }>({
      query: (body) => ({ url: "/reset-password", method: "POST", body }),
    }),
  }),
})

export const {
  useSignupMutation,
  useVerifyOTPMutation,
  useResendOTPMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi
