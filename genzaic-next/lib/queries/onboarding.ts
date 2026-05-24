"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { getJSON, postJSON } from "@/lib/react-query/fetcher"

export const onboardingKeys = {
  all: ["onboarding"] as const,
  status: () => [...onboardingKeys.all, "status"] as const,
} as const

export function useOnboardingStatus() {
  return useQuery({
    queryKey: onboardingKeys.status(),
    queryFn: () => getJSON<{ complete: boolean; step: number }>("/api/onboarding/status"),
  })
}

export function useSelectPlan() {
  const qc = useQueryClient()
  const { update } = useSession()
  return useMutation({
    mutationFn: (input: { plan: string }) =>
      postJSON<typeof input, { planType?: string; isSeller?: boolean; role?: string }>(
        "/api/onboarding/plan",
        input,
      ),
    onSuccess: async (data) => {
      // Plan selection flips role -> "seller" and isSeller -> true server-side.
      // Without rotating the JWT here, middleware.ts keeps seeing the old
      // buyer claims and bounces the user away from seller-only routes until
      // their token naturally refreshes (lib/auth/config.ts, 7-day maxAge).
      await update({
        planType: data.planType,
        isSeller: data.isSeller,
        role: data.role,
      })
      qc.invalidateQueries({ queryKey: onboardingKeys.status() })
    },
  })
}

export function useCompleteOnboarding() {
  const qc = useQueryClient()
  const { update } = useSession()
  return useMutation({
    mutationFn: () => postJSON<undefined, unknown>("/api/onboarding/complete"),
    onSuccess: async () => {
      // Rotate the JWT so `middleware.ts` sees `onboardingComplete: true` on
      // the next request — otherwise the user can be looped back to /onboarding
      // until their token naturally refreshes (lib/auth/config.ts).
      await update({ onboardingComplete: true })
      qc.invalidateQueries({ queryKey: onboardingKeys.status() })
    },
  })
}

export function useSkipOnboarding() {
  const qc = useQueryClient()
  const { update } = useSession()
  return useMutation({
    mutationFn: () => postJSON<undefined, unknown>("/api/onboarding/skip"),
    onSuccess: async () => {
      await update({ onboardingComplete: true })
      qc.invalidateQueries({ queryKey: onboardingKeys.status() })
    },
  })
}
