"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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
  })
}

export function useDeleteKyc() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => deleteJSON("/api/kyc/"),
    onSuccess: () => qc.invalidateQueries({ queryKey: kycKeys.current() }),
  })
}
