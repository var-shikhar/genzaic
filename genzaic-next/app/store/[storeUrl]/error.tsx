"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertCircle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StorefrontErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function StorefrontError({ error, reset }: StorefrontErrorProps) {
  useEffect(() => {
    // Surface for monitoring (Sentry, etc.) once that's wired up.
    console.error("Storefront route error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Couldn&apos;t load store</h1>
        <p className="text-muted-foreground mb-6">
          Something went wrong while loading this store. Check your connection
          and try again.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset} className="gap-2">
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
