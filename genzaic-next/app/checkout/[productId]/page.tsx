"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import Image from "next/image"
import { ShoppingCart, Package, Loader2 } from "lucide-react"
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/checkout"
import { useCheckoutProduct, useCreateOrder } from "@/lib/queries/checkout"
import { getApiErrorMessage } from "@/lib/api-error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { formatCurrency, calculateGST, calculatePlatformFee } from "@/lib/utils"
import { ikThumb } from "@/lib/image"

export default function CheckoutPage() {
  const { productId } = useParams<{ productId: string }>()
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user as { name?: string | null; email?: string | null } | undefined
  const { data: product, isLoading } = useCheckoutProduct(productId)
  const { mutateAsync: createOrder, isPending: isCreating } = useCreateOrder()

  const price = product ? parseFloat(product.price) : 0
  const gst = product ? calculateGST(price) : { gst: 0, total: 0 }
  const platformFee = product?.platformFeeMode === "buyer" ? calculatePlatformFee(price) : 0
  // Seller mode: buyer pays price + GST. Buyer mode: buyer pays price + GST + platform fee.
  const total = gst.total + platformFee

  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    mode: "onChange",
    defaultValues: {
      productId: productId,
      buyerName: user?.name ?? "",
      buyerEmail: user?.email ?? "",
      buyerPhone: "",
      buyerGstin: "",
    },
  })

  // Re-evaluate validity once defaults are populated so the Pay button
  // becomes enabled immediately for logged-in users (whose name/email
  // come from the session and are already valid).
  useEffect(() => {
    void form.trigger()
  }, [form, user?.name, user?.email])

  const onSubmit = async (values: CheckoutInput) => {
    try {
      const order = await createOrder({
        productId: productId,
        buyerName: values.buyerName,
        buyerEmail: values.buyerEmail,
        buyerPhone: values.buyerPhone || undefined,
        buyerGstin: values.buyerGstin || undefined,
      })
      toast.success("Order placed successfully!")
      // Hand the buyer a short-lived access token in the URL so the
      // confirmation page can show the download. They'll also get a
      // longer-lived link in their email for later.
      const tokenParam = order.accessToken ? `?t=${order.accessToken}` : ""
      router.push(`/order/${order.id}${tokenParam}`)
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Checkout failed"))
    }
  }

  if (isLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-4xl p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    </div>
  )

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Product not found</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" /> Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <Card>
            <CardHeader><CardTitle>Your Details</CardTitle></CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="buyerName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="buyerEmail" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="buyerPhone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (optional)</FormLabel>
                      <FormControl><Input placeholder="9876543210" {...field} value={field.value ?? ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="buyerGstin" render={({ field }) => (
                    <FormItem>
                      <FormLabel>GSTIN (optional)</FormLabel>
                      <FormControl><Input placeholder="For business invoices" {...field} value={field.value ?? ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gradient-primary text-white mt-6"
                    disabled={isCreating || !form.formState.isValid}
                  >
                    {isCreating && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    {isCreating ? "Processing..." : `Pay ${formatCurrency(total)}`}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    By purchasing you agree to our Terms of Service
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  {product.thumbnailUrl ? (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={ikThumb(product.thumbnailUrl, 160)}
                        alt={product.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{product.title}</h3>
                    <p className="text-sm text-muted-foreground">by {product.seller.name}</p>
                    <p className="font-bold mt-1">{formatCurrency(product.price)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-medium">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST (18%)</span>
                    <span>{formatCurrency(gst.gst)}</span>
                  </div>
                  {platformFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform fee</span>
                      <span>{formatCurrency(platformFee)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
