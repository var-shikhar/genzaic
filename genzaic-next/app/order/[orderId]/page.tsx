import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  CheckCircle2,
  Download,
  ExternalLink,
  Mail,
  Package,
  AlertCircle,
  LogIn,
} from "lucide-react"
import { db, orders, orderItems } from "@/lib/db"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { verifyOrderAccessToken } from "@/lib/order-access"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"
import { ikThumb } from "@/lib/image"
import { OrderDownloadButton } from "./OrderDownloadButton"
import { ResendLinkButton } from "./ResendLinkButton"

// Order pages render auth-dependent content (token check + session check)
// so they must be dynamic — opting out of any caching.
export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ orderId: string }>
  searchParams: Promise<{ t?: string }>
}

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: PageProps) {
  const { orderId } = await params
  const { t: tokenParam } = await searchParams

  // Pull the order row + its first item in parallel.
  const [orderRow, itemsRows] = await Promise.all([
    db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1),
    db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId))
      .limit(1),
  ])

  const order = orderRow[0]
  if (!order) notFound()

  // Decide access. Either (a) the token in the URL is valid AND points at
  // this order, OR (b) the viewer is logged in as the buyer that placed
  // this order. Anything else falls through to the "link expired" state.
  let access: "granted" | "expired" | "denied" = "denied"
  if (tokenParam) {
    const check = await verifyOrderAccessToken(tokenParam)
    if (check.ok && check.orderId === order.id) {
      access = "granted"
    } else if (check.ok === false && check.reason === "expired") {
      access = "expired"
    }
  }

  if (access !== "granted") {
    const session = await auth()
    if (session?.user?.id && session.user.id === order.buyerId) {
      access = "granted"
    }
  }

  if (access !== "granted") {
    return <ExpiredLinkView orderId={order.id} buyerEmail={order.buyerEmail} />
  }

  const item = itemsRows[0]
  if (!item) notFound()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          {/* Pulse-ring confirmation mark. Two staggered `animate-ping`
              layers under a solid emerald core read as a successful
              "stamp landed" moment without needing JS. The rings are
              aria-hidden — decorative only — and respect reduced-motion. */}
          <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-emerald-400/35 animate-ping motion-reduce:hidden"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-emerald-400/45 animate-ping motion-reduce:hidden"
              style={{ animationDelay: "700ms" }}
            />
            <div className="relative w-16 h-16 rounded-full bg-emerald-500 dark:bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <CheckCircle2
                className="h-8 w-8 text-white"
                strokeWidth={2.5}
              />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Order confirmed</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Order #{order.orderNumber}
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex gap-3 items-center">
              {item.productThumbnail ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={ikThumb(item.productThumbnail, 128)}
                    alt={item.productTitle}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Package className="h-7 w-7 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-medium truncate">{item.productTitle}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>
            </div>

            <Separator />

            <DeliveryAction
              orderId={order.id}
              deliveryType={item.deliveryType}
              externalUrl={item.externalUrl}
              accessToken={tokenParam ?? null}
            />
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button asChild variant="outline" className="w-full gap-2">
            <Link href={`/login?callbackUrl=/my-purchases`}>
              <LogIn className="h-4 w-4" />
              Log in to see all your purchases
            </Link>
          </Button>
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            We&apos;ve emailed a copy to{" "}
            <span className="font-medium text-foreground">
              {order.buyerEmail}
            </span>
            . You can log in any time using the link in that email to see
            this and your other purchases under{" "}
            <span className="font-medium text-foreground">My Purchases</span>.
          </p>
        </div>
      </div>
    </div>
  )
}

function DeliveryAction({
  orderId,
  deliveryType,
  externalUrl,
  accessToken,
}: {
  orderId: string
  deliveryType: string
  externalUrl: string | null
  accessToken: string | null
}) {
  if (deliveryType === "download") {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium flex items-center gap-2">
          <Download className="h-4 w-4 text-blue-600" />
          Instant download
        </p>
        <OrderDownloadButton orderId={orderId} accessToken={accessToken} />
      </div>
    )
  }

  if (deliveryType === "external_link") {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-purple-600" />
          External access
        </p>
        {externalUrl ? (
          <Button
            asChild
            size="lg"
            className="w-full gradient-primary text-white gap-2"
          >
            <a href={externalUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-5 w-5" />
              Open access link
            </a>
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            The seller will send you an access link by email shortly.
          </p>
        )}
      </div>
    )
  }

  // manual
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium flex items-center gap-2">
        <Mail className="h-4 w-4 text-amber-600" />
        Manual delivery
      </p>
      <p className="text-sm text-muted-foreground">
        The seller will reach out to you by email with delivery details.
        Please check your inbox in the next 24 hours.
      </p>
    </div>
  )
}

function ExpiredLinkView({
  orderId,
  buyerEmail,
}: {
  orderId: string
  buyerEmail: string
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-amber-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Link expired</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            For security, the access link to this order is time-limited. We
            can email you a fresh link to{" "}
            <span className="font-medium text-foreground">{buyerEmail}</span>
            , or you can log in to see all your purchases under{" "}
            <span className="font-medium text-foreground">My Purchases</span>.
          </p>
        </div>
        <div className="space-y-3">
          <ResendLinkButton orderId={orderId} />
          <Button asChild variant="outline" className="w-full gap-2">
            <Link href={`/login?callbackUrl=/my-purchases`}>
              <LogIn className="h-4 w-4" />
              Log in to My Purchases
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
