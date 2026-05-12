"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useOptimisticMutation } from "@/lib/react-query/use-optimistic-mutation"
import { deleteJSON, getJSON, postForm } from "@/lib/react-query/fetcher"

export interface KycData {
  id: string
  // Identity
  panNumber?: string | null
  panFileUrl?: string | null
  panFileId?: string | null
  aadhaarNumber?: string | null
  aadhaarFileUrl?: string | null
  aadhaarFileId?: string | null
  // Legacy single-document fields kept for back-compat with old rows.
  documentType?: "pan" | "aadhaar" | null
  documentFileUrl?: string | null
  // Payment — UPI
  upiId?: string | null
  vpaStatus: "pending" | "success" | "failed" | "error"
  vpaHolderName?: string | null
  // Payment — Bank
  accountHolderName: string
  accountNumber: string
  ifscCode: string
  bankName: string
  pennyDropStatus: "pending" | "success" | "failed"
  bankHolderName?: string | null
  // Status
  verificationStatus: "not_submitted" | "pending" | "verified" | "rejected"
  rejectionReason?: string | null
  verifiedAt?: string | null
  createdAt: string
  updatedAt: string
}

export const kycKeys = {
  all: ["kyc"] as const,
  current: () => [...kycKeys.all, "current"] as const,
} as const

export function useKyc() {
  return useQuery({
    queryKey: kycKeys.current(),
    queryFn: () => getJSON<KycData | null>("/api/kyc/"),
  })
}

export function useSubmitKyc() {
  const { update } = useSession()
  return useOptimisticMutation<FormData, KycData, KycData | null>({
    mutationFn: (form) => postForm<KycData>("/api/kyc/", form),
    optimistic: {
      queryKey: kycKeys.current(),
      updater: (old) => {
        if (!old) return old
        return { ...old, verificationStatus: "pending", rejectionReason: null }
      },
    },
    invalidateKeys: [kycKeys.current()],
    onSuccess: (data) => {
      // Mirror the server-side kycStatus into the JWT so middleware/payout
      // gates see the new status without forcing a re-login.
      const kycStatus =
        data.verificationStatus === "rejected" ? "rejected" : "pending"
      void update({ kycStatus })
    },
  })
}

export function useDeleteKyc() {
  const qc = useQueryClient()
  const { update } = useSession()
  return useMutation({
    mutationFn: () => deleteJSON("/api/kyc/"),
    onSuccess: async () => {
      await update({ kycStatus: "not_submitted" })
      qc.invalidateQueries({ queryKey: kycKeys.current() })
    },
  })
}
