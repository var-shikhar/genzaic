"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"

export interface ExtractedProduct {
  title: string
  description: string
  price?: number
  originalPrice?: number
  subscriptionDuration?: string
}

export interface ParseProductTextResult {
  products: ExtractedProduct[]
  count: number
}

export const aiKeys = {
  all: ["ai"] as const,
} as const

interface ApiErrorBody {
  error?: string
  issues?: Record<string, string[]>
}

function cleanJsonText(raw: string): string {
  return raw
    .replace(/^```(?:json)?\n?/, "")
    .replace(/\n?```$/, "")
    .trim()
}

function validateExtracted(parsed: unknown): ParseProductTextResult {
  if (
    !parsed ||
    typeof parsed !== "object" ||
    !Array.isArray((parsed as { products?: unknown }).products)
  ) {
    return { products: [], count: 0 }
  }
  const products = ((parsed as { products: unknown[] }).products as unknown[])
    .filter((p): p is Record<string, unknown> => typeof p === "object" && p !== null)
    .map((p) => ({
      title: typeof p.title === "string" ? p.title : "",
      description: typeof p.description === "string" ? p.description : "",
      price: typeof p.price === "number" ? p.price : undefined,
      originalPrice: typeof p.originalPrice === "number" ? p.originalPrice : undefined,
      subscriptionDuration:
        typeof p.subscriptionDuration === "string" ? p.subscriptionDuration : undefined,
    }))
    .filter((p) => p.title.length > 0)
  return { products, count: products.length }
}

/**
 * Streams Gemini's raw output from the server, exposes the in-flight text via
 * `streamingText` so callers can render live progress, and parses the
 * accumulated JSON once the stream ends.
 *
 * The mutation result shape (`ParseProductTextResult`) is identical to what
 * the prior buffered implementation returned, so callers don't change.
 */
export function useParseProductText() {
  const [streamingText, setStreamingText] = useState("")

  const mutation = useMutation<ParseProductTextResult, Error, { text: string }>({
    mutationFn: async (input) => {
      setStreamingText("")

      const res = await fetch("/api/ai/parse-product-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })

      if (!res.ok) {
        let errBody: ApiErrorBody = {}
        try {
          errBody = (await res.json()) as ApiErrorBody
        } catch {
          /* response had no JSON body */
        }
        throw new Error(errBody.error ?? `Request failed (${res.status})`)
      }
      if (!res.body) {
        throw new Error("AI response stream unavailable")
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setStreamingText(accumulated)
      }
      accumulated += decoder.decode()

      const cleaned = cleanJsonText(accumulated)
      let parsed: unknown
      try {
        parsed = JSON.parse(cleaned)
      } catch {
        throw new Error("Failed to parse AI response")
      }
      return validateExtracted(parsed)
    },
    onSettled: () => {
      // Leave the last streamingText snapshot in place so consumers can
      // display it briefly after completion — they can reset by calling
      // `mutation.reset()` if they want a clean slate.
    },
  })

  return Object.assign(mutation, { streamingText })
}
