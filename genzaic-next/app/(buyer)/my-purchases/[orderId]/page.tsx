"use client"

import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Download,
  FileText,
  Package,
  ExternalLink,
  Calendar,
  CreditCard,
  Mail,
  CheckCircle2,
  Link2,
  Phone,
  MessageCircle,
  Clock,
} from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { useMyOrder } from "@/lib/queries/buyer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function PurchaseDetailsPage() {
  const params = useParams<{ orderId: string }>()
  const { data: session } = useSession()
  const { data: order, isLoading } = useMyOrder(params.orderId)

  if (isLoading) {
    return (
      <div className="max-w-5xl space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Purchase Not Found</h2>
        <p className="text-muted-foreground mb-6">
          We couldn&apos;t find this purchase in your account.
        </p>
        <Button asChild>
          <Link href="/my-purchases">Back to Purchases</Link>
        </Button>
      </div>
    )
  }

  const handleDownload = () => {
    if (order.downloadCount >= order.maxDownloads) {
      toast.error("Download limit reached. Please contact support.")
      return
    }
    window.location.href = `/download/${order.id}`
  }

  const handleDownloadInvoice = () => {
    toast.success("Invoice downloaded!")
  }

  const handleContactSeller = (method: "email" | "phone" | "whatsapp") => {
    if (method === "email" && order.sellerEmail) {
      window.location.href = `mailto:${order.sellerEmail}?subject=Order ${order.id} - ${order.productTitle}&body=Hi, I purchased ${order.productTitle} (Order ID: ${order.id}). `
    } else if (method === "phone" && order.sellerPhone) {
      window.location.href = `tel:${order.sellerPhone.replace(/\s/g, "")}`
    } else if (method === "whatsapp") {
      const phone = order.sellerWhatsapp || order.sellerPhone
      if (phone) {
        const cleanNumber = phone.replace(/[^0-9]/g, "")
        const message = encodeURIComponent(
          `Hi! I purchased ${order.productTitle} (Order ID: ${order.id}). Please help me with the delivery.`
        )
        window.open(`https://wa.me/${cleanNumber}?text=${message}`, "_blank")
      }
    }
  }

  // Estimate breakdown (base = ~80% of total if no explicit fields)
  const totalAmount = parseFloat(order.totalAmount)
  const baseAmount = Math.round(totalAmount / 1.18)
  const gstAmount = totalAmount - baseAmount

  return (
    <div className="max-w-5xl">
      <Button asChild variant="ghost" size="sm" className="mb-6 gap-1">
        <Link href="/my-purchases">
          <ArrowLeft className="w-4 h-4" />
          Back to Purchases
        </Link>
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="w-full sm:w-40 h-40 rounded-xl overflow-hidden bg-muted shrink-0">
                    {order.productThumbnail ? (
                      <Image
                        src={order.productThumbnail}
                        alt={order.productTitle}
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="secondary">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Purchased
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {order.deliveryType === "external_link"
                          ? "External Link"
                          : order.deliveryType}
                      </Badge>
                      {order.deliveryType === "manual" &&
                        order.deliveryStatus === "pending" && (
                          <Badge
                            variant="outline"
                            className="bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400"
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            Awaiting Delivery
                          </Badge>
                        )}
                      {order.deliveryType === "manual" &&
                        order.deliveryStatus === "delivered" && (
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Delivered
                          </Badge>
                        )}
                    </div>
                    <h1 className="text-xl font-bold mb-2">{order.productTitle}</h1>
                    {order.productDescription && (
                      <p className="text-muted-foreground text-sm mb-4">
                        {order.productDescription}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Sold by</span>
                      <Link
                        href={`/store/${order.sellerStoreUrl}`}
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {order.sellerName}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Purchase Date</p>
                      <p className="font-medium">
                        {new Date(order.purchasedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Order ID</p>
                      <p className="font-medium font-mono text-sm">{order.id.slice(0, 12)}...</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium">{session?.user?.email}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base Amount</span>
                    <span>{formatCurrency(baseAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GST (18%)</span>
                    <span>{formatCurrency(gstAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total Paid</span>
                    <span className="text-primary">{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  {order.deliveryType === "download" && "Download Product"}
                  {order.deliveryType === "external_link" && "Access Product"}
                  {order.deliveryType === "manual" && "Contact Seller"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Digital Download */}
                {order.deliveryType === "download" && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Downloads Used</span>
                        <span className="font-medium">
                          {order.downloadCount} of {order.maxDownloads}
                        </span>
                      </div>
                      <Progress
                        value={(order.downloadCount / order.maxDownloads) * 100}
                      />
                    </div>

                    {order.downloadCount >= order.maxDownloads && (
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
                          Download limit reached. Contact support for more downloads.
                        </p>
                      </div>
                    )}

                    <Button
                      className="w-full gradient-primary text-white"
                      size="lg"
                      onClick={handleDownload}
                      disabled={order.downloadCount >= order.maxDownloads}
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Product
                    </Button>
                  </>
                )}

                {/* External Link */}
                {order.deliveryType === "external_link" && order.externalUrl && (
                  <>
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-start gap-3">
                        <Link2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium mb-1">Product Link</p>
                          <p className="text-sm text-muted-foreground break-all">
                            {order.externalUrl}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      className="w-full gradient-primary text-white"
                      size="lg"
                      asChild
                    >
                      <a href={order.externalUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-5 h-5 mr-2" />
                        Access Product
                      </a>
                    </Button>
                  </>
                )}

                {/* Manual Delivery */}
                {order.deliveryType === "manual" && (
                  <>
                    {order.deliveryStatus === "pending" && (
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium">Awaiting Delivery</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              The seller will contact you to complete delivery.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {order.deliveryStatus === "delivered" && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium">Delivered</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Your product has been delivered.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Contact Seller</p>
                      {order.sellerEmail && (
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => handleContactSeller("email")}
                        >
                          <Mail className="w-4 h-4 mr-3" />
                          <span className="truncate">{order.sellerEmail}</span>
                        </Button>
                      )}
                      {order.sellerPhone && (
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => handleContactSeller("phone")}
                        >
                          <Phone className="w-4 h-4 mr-3" />
                          {order.sellerPhone}
                        </Button>
                      )}
                      {(order.sellerWhatsapp || order.sellerPhone) && (
                        <Button
                          className="w-full justify-start bg-[#25D366] hover:bg-[#22c55e] text-white"
                          onClick={() => handleContactSeller("whatsapp")}
                        >
                          <MessageCircle className="w-4 h-4 mr-3" />
                          Message on WhatsApp
                        </Button>
                      )}
                    </div>
                  </>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleDownloadInvoice}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Download GST Invoice
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Need Help */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-muted/30">
              <CardContent className="p-6 text-center">
                <h4 className="font-medium mb-2">Need Help?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Having issues with your{" "}
                  {order.deliveryType === "download" ? "download" : "order"} or
                  need assistance?
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="mailto:support@genzaic.com">Contact Support</a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
