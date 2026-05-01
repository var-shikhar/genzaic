"use client"

import { useQuery } from "@tanstack/react-query"
import { getJSON } from "@/lib/react-query/fetcher"

export interface Tag {
  id: string
  name: string
  slug: string
}

export const tagKeys = {
  all: ["tags"] as const,
  search: (q: string) => [...tagKeys.all, "search", q] as const,
} as const

export function useTagsSearch(query: string) {
  return useQuery({
    queryKey: tagKeys.search(query),
    queryFn: async () => {
      const res = await getJSON<{ tags: Tag[] }>(
        `/api/tags${query ? `?search=${encodeURIComponent(query)}` : ""}`,
      )
      return res.tags
    },
    staleTime: 30 * 1000,
  })
}
