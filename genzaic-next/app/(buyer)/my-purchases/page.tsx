"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useMyOrders } from "@/lib/queries/buyer"
import { useCategories } from "@/lib/queries/categories"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
  Download,
  ExternalLink,
  MessageSquare,
  Package,
  ShoppingBag,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function MyPurchasesPage() {
  const { data: orders, isLoading } = useMyOrders()
  // Warm the categories cache so any product/edit form opened from here is instant.
  useCategories()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Purchases</h1>
        <p className="text-muted-foreground mt-1">
          {orders?.length ?? 0} purchases
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : !orders?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No purchases yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Browse our marketplace to find great products
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex gap-4 p-4">
                  {order.productThumbnail ? (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={order.productThumbnail}
                        alt={order.productTitle}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">
                      {order.productTitle}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      by {order.sellerName}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm font-semibold">
                        {formatCurrency(order.totalAmount)}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(order.purchasedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {order.deliveryType === "download" &&
                      order.downloadLink && (
                        <Button
                          asChild
                          size="sm"
                          className="gradient-primary text-white gap-1"
                        >
                          <Link href={`/my-purchases/${order.id}`}>
                            <Download className="h-3.5 w-3.5" /> Download
                          </Link>
                        </Button>
                      )}
                    {order.deliveryType === "external_link" &&
                      order.externalUrl && (
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="gap-1"
                        >
                          <a
                            href={order.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> Access
                          </a>
                        </Button>
                      )}
                    {order.deliveryType === "manual" && (
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="gap-1"
                      >
                        <Link href={`/my-purchases/${order.id}`}>
                          <MessageSquare className="h-3.5 w-3.5" /> Details
                        </Link>
                      </Button>
                    )}
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/my-purchases/${order.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
