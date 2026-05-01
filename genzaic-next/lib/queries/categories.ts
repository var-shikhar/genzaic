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
    gcTime: 60 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
  })
}
