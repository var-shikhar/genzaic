"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { AlertTriangle, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BuyButtonProps {
  productId: string
  sellerId: string
}

export function BuyButton({ productId, sellerId }: BuyButtonProps) {
  const { data: session, status } = useSession()
  const viewerId = session?.user?.id
  const isOwner = status === "authenticated" && viewerId === sellerId

  if (isOwner) {
    return (
      <div
        className="w-full h-12 px-4 rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 flex items-center justify-center gap-2 cursor-not-allowed select-none"
        role="status"
        aria-disabled="true"
      >
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
          You can&apos;t purchase your own product
        </span>
      </div>
    )
  }

  return (
    <Button asChild size="lg" className="w-full h-12 gap-2 gradient-primary text-white">
      <Link href={`/checkout/${productId}`}>
        <ShoppingCart className="w-5 h-5" />
        Buy Now
      </Link>
    </Button>
  )
}
