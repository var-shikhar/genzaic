"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { Product } from "@/lib/db/schema"
import { getJSON, patchJSON, putForm } from "@/lib/react-query/fetcher"

export interface Storefront {
  id: string
  userId: string
  storeUrl?: string | null
  storeName?: string | null
  description?: string | null
  profileImageUrl?: string | null
  coverImageUrl?: string | null
  tagline?: string | null
  themeId: string
  primaryColor: string
  fontFamily: string
  isPublished: boolean
  platformFeeMode: "seller" | "buyer"
  upiId?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  contactWhatsapp?: string | null
  socialInstagram?: string | null
  socialTwitter?: string | null
  socialYoutube?: string | null
  socialWebsite?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string | null
  createdAt: string
  updatedAt: string
}

export interface PublicStorefront extends Storefront {
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

export function useCheckSlug() {
  const qc = useQueryClient()
  return {
    check: (slug: string) =>
      qc.fetchQuery({
        queryKey: storefrontKeys.slugCheck(slug),
        queryFn: () => getJSON<{ available: boolean }>(`/api/storefront/check-slug/${slug}`),
      }),
  }
}

export function useStorefrontStats() {
  return useQuery({
    queryKey: storefrontKeys.stats(),
    queryFn: () =>
      getJSON<{ totalViews: number; totalRevenue: string; totalOrders: number }>(
        "/api/storefront/stats",
      ),
  })
}
