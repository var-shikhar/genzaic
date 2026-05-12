"use client"

import { useCallback } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { Product, Storefront as DbStorefront } from "@/lib/db/schema"
import { getJSON, patchJSON, putForm } from "@/lib/react-query/fetcher"

export type Storefront = DbStorefront

export type PublicStorefront = Storefront & {
  products: Product[]
  seller?: {
    id: string
    name: string
    avatarUrl?: string | null
    followersCount: number
    totalSales: number
  }
}

export const storefrontKeys = {
  all: ["storefront"] as const,
  current: () => [...storefrontKeys.all, "current"] as const,
  public: (slug: string) => [...storefrontKeys.all, "public", slug] as const,
  slugCheck: (slug: string) => [...storefrontKeys.all, "slug-check", slug] as const,
  stats: () => [...storefrontKeys.all, "stats"] as const,
} as const

export interface StorefrontStats {
  totalViews: number
  totalRevenue: string
  totalOrders: number
}

export function useStorefront() {
  return useQuery({
    queryKey: storefrontKeys.current(),
    queryFn: () => getJSON<Storefront>("/api/storefront"),
  })
}

export function usePublicStorefront(slug: string) {
  return useQuery({
    queryKey: storefrontKeys.public(slug),
    queryFn: () => getJSON<PublicStorefront>(`/api/storefront/public/${slug}`),
    enabled: Boolean(slug),
    gcTime: 3_600_000,
  })
}

export function useUpdateStorefront() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (form: FormData) => putForm<Storefront>("/api/storefront", form),
    onSuccess: (data) => {
      qc.setQueryData(storefrontKeys.current(), data)
      qc.invalidateQueries({ queryKey: storefrontKeys.current() })
    },
  })
}

export function useTogglePublish() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => patchJSON<{ isPublished: boolean }>("/api/storefront/toggle-publish"),
    onSuccess: (data) => {
      qc.setQueryData<Storefront | undefined>(storefrontKeys.current(), (old) =>
        old ? { ...old, isPublished: data.isPublished } : old,
      )
      qc.invalidateQueries({ queryKey: storefrontKeys.current() })
    },
  })
}

/** Lifetime stats for the seller's own storefront — views, revenue, order count. */
export function useStorefrontStats() {
  return useQuery({
    queryKey: storefrontKeys.stats(),
    queryFn: () => getJSON<StorefrontStats>("/api/storefront/stats"),
    staleTime: 30_000,
  })
}

/**
 * Imperative slug-availability check. Returns a stable function — call it
 * with a candidate slug to fetch availability. Caches per-slug via TanStack
 * Query so repeated checks of the same string don't re-hit the network.
 */
export function useCheckSlug() {
  const qc = useQueryClient()
  return useCallback(
    (slug: string) =>
      qc.fetchQuery({
        queryKey: storefrontKeys.slugCheck(slug),
        queryFn: () =>
          getJSON<{ available: boolean }>(`/api/storefront/check-slug/${slug}`),
        staleTime: 60_000,
      }),
    [qc],
  )
}

