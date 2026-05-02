"use client"

import { useQuery } from "@tanstack/react-query"
import { getJSON } from "@/lib/react-query/fetcher"

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parentId: string | null
  sortOrder: number
}

export const categoryKeys = {
  all: ["categories"] as const,
} as const

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: async () => {
      const res = await getJSON<{ categories: Category[] }>("/api/categories")
      return res.categories
    },
    // Categories are effectively static reference data — they change at deploy
    // time, not user-action time. Treat as never-stale for the session and keep
    // around for 24h so navigating in/out of forms never refetches.
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}
