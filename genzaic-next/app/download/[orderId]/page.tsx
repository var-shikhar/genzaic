"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Download, CheckCircle, Package, AlertCircle } from "lucide-react"
import { useGetOrderForDownloadQuery, useRecordDownloadMutation } from "@/store/api/checkoutApi"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"

export default function DownloadPage({ params }: { params: { orderId: string } }) {
  const [downloaded, setDownloaded] = useState(false)
  const { data: order, isLoading } = useGetOrderForDownloadQuery(params.orderId)
  const [recordDownload] = useRecordDownloadMutation()

  const handleDownload = async () => {
    if (!order?.downloadLink) return
    try {
      await recordDownload(params.orderId).unwrap()
      window.open(order.downloadLink, "_blank")
      setDownloaded(true)
    } catch {
      window.open(order.downloadLink, "_blank")
      setDownloaded(true)
    }
  }

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-4 p-6">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  )

  if (!order) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <AlertCircle className="h-12 w-12 text-muted-foreground" />
      <p className="text-muted-foreground">Order not found or access denied</p>
      <Button asChild variant="outline"><Link href="/my-purchases">My Purchases</Link></Button>
    </div>
  )

  const downloadsLeft = order.maxDownloads - order.downloadCount
  const progress = (order.downloadCount / order.maxDownloads) * 100

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {downloaded ? (
          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold">Download started!</h2>
            <p className="text-muted-foreground text-sm">If it didn&apos;t start, click the button below.</p>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-bold">Your Purchase</h1>
            <p className="text-muted-foreground mt-1">Ready to download</p>
          </div>
        )}

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-3 items-center">
              {order.productThumbnail ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                  <Image src={order.productThumbnail} alt={order.productTitle} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Package className="h-7 w-7 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="font-medium">{order.productTitle}</p>
                <p className="text-sm text-muted-foreground">{formatCurrency(order.totalAmount)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Downloads used</span>
                <span className={downloadsLeft === 0 ? "text-destructive font-medium" : ""}>
                  {order.downloadCount}/{order.maxDownloads}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              {downloadsLeft === 0 && (
                <p className="text-xs text-destructive">You&apos;ve reached the download limit.</p>
              )}
            </div>

            <Button
              onClick={handleDownload}
              disabled={!order.downloadLink || downloadsLeft === 0}
              size="lg"
              className="w-full gradient-primary text-white gap-2"
            >
              <Download className="h-5 w-5" />
              {downloaded ? "Download Again" : "Download Now"}
            </Button>
          </CardContent>
        </Card>

        <Button asChild variant="ghost" className="w-full">
          <Link href="/my-purchases">View All Purchases</Link>
        </Button>
      </div>
    </div>
  )
}
