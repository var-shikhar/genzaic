"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useOptimisticMutation } from "@/lib/react-query/use-optimistic-mutation"
import { getJSON, putForm, putJSON } from "@/lib/react-query/fetcher"

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
  defaultProductActive: boolean
  createdAt: string
}

export const userKeys = {
  all: ["user"] as const,
  profile: () => [...userKeys.all, "profile"] as const,
  storeUrlCheck: (slug: string) => [...userKeys.all, "store-url", slug] as const,
} as const

export function useProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => getJSON<UserProfile>("/api/user/profile"),
  })
}

export function useUpdateProfile() {
  return useOptimisticMutation<FormData, UserProfile, UserProfile | undefined>({
    mutationFn: (form) => putForm<UserProfile>("/api/user/profile", form),
    invalidateKeys: [userKeys.profile()],
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) =>
      putJSON<typeof input, { message: string }>("/api/user/password", input),
  })
}

export function useCheckStoreUrl() {
  const qc = useQueryClient()
  return {
    check: (storeUrl: string) =>
      qc.fetchQuery({
        queryKey: userKeys.storeUrlCheck(storeUrl),
        queryFn: () => getJSON<{ available: boolean }>(`/api/user/check-store-url/${storeUrl}`),
      }),
  }
}
