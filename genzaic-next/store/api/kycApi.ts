import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export interface KycData {
  id: string
  documentType: "pan" | "aadhaar"
  panNumber?: string | null
  aadhaarNumber?: string | null
  documentFileUrl?: string | null
  accountHolderName: string
  accountNumber: string
  ifscCode: string
  bankName: string
  verificationStatus: "not_submitted" | "pending" | "verified" | "rejected"
  pennyDropStatus: "pending" | "success" | "failed"
  rejectionReason?: string | null
  verifiedAt?: string | null
  createdAt: string
  updatedAt: string
}

export const kycApi = createApi({
  reducerPath: "kycApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/kyc" }),
  tagTypes: ["KYC"],
  endpoints: (builder) => ({
    getKyc: builder.query<KycData | null, void>({
      query: () => "/",
      providesTags: ["KYC"],
    }),
    submitKyc: builder.mutation<KycData, FormData>({
      query: (body) => ({ url: "/", method: "POST", body }),
      invalidatesTags: ["KYC"],
    }),
    deleteKyc: builder.mutation<void, void>({
      query: () => ({ url: "/", method: "DELETE" }),
      invalidatesTags: ["KYC"],
    }),
  }),
})

export const { useGetKycQuery, useSubmitKycMutation, useDeleteKycMutation } = kycApi
