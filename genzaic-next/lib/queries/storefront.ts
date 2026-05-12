"use client"

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

