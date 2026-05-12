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
  return useMutation({
    mutationFn: (input: { plan: string }) => postJSON<typeof input, unknown>("/api/onboarding/plan", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: onboardingKeys.status() }),
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
