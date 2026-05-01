"use client"

import { useMutation } from "@tanstack/react-query"
import { postJSON } from "@/lib/react-query/fetcher"

export interface ExtractedProduct {
  title: string
  description: string
  price?: number
  originalPrice?: number
  subscriptionDuration?: string
}

export const aiKeys = {
  all: ["ai"] as const,
} as const

export function useParseProductText() {
  return useMutation({
    mutationFn: (input: { text: string }) =>
      postJSON<typeof input, { products: ExtractedProduct[]; count: number }>(
        "/api/ai/parse-product-text",
        input,
      ),
  })
}
