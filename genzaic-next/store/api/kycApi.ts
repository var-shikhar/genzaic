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
      // Optimistic: flip the cached KYC status to "pending" the moment the
      // user clicks Submit, so the page reflects the in-review state without
      // waiting for the server. Server response replaces this on fulfillment.
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          kycApi.util.updateQueryData("getKyc", undefined, (draft) => {
            if (draft) {
              draft.verificationStatus = "pending"
              draft.rejectionReason = null
            }
          })
        )
        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
    }),
    deleteKyc: builder.mutation<void, void>({
      query: () => ({ url: "/", method: "DELETE" }),
      invalidatesTags: ["KYC"],
    }),
  }),
})

export const { useGetKycQuery, useSubmitKycMutation, useDeleteKycMutation } = kycApi
