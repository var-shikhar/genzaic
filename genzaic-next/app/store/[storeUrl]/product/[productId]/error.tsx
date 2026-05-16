"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCcw, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Shown when both the initial DB fetch AND its single retry fail for the
 * product page (see retryOnce in lib/data/public-storefront.ts). Almost
 * always a transient connection blip — we offer one user-driven retry
 * before suggesting they head back to the store.
 */
export default function ProductDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[product-detail/error.tsx]", error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            We couldn&apos;t load this product
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Something went wrong reaching our servers. It&apos;s usually a
            quick blip — try again, or head back to the store.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button onClick={reset} className="gap-2 w-full sm:w-auto">
            <RefreshCcw className="w-4 h-4" />
            Try again
          </Button>
          <Button asChild variant="outline" className="gap-2 w-full sm:w-auto">
            <Link href="..">
              <ArrowLeft className="w-4 h-4" />
              Back to store
            </Link>
          </Button>
        </div>

        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono pt-2">
            Ref · {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
