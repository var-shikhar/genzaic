import React, { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Package,
  Star,
  Download,
  ShoppingCart,
  Share2,
  Heart,
  Loader2,
  ExternalLink,
  Mail,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { checkoutAPI, ProductForCheckout } from "@/lib/api/checkout"

// Helper to format currency in INR
const formatINR = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function ProductDetailPage() {
  const { storeUrl, productId } = useParams<{
    storeUrl: string
    productId: string
  }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const [product, setProduct] = useState<ProductForCheckout | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Load product details
  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setHasError(true)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await checkoutAPI.getProductForCheckout(productId)
        setProduct(response.product)
        setHasError(false)
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load product"
        console.error("Failed to load product:", error)
        toast.error(errorMessage)
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }
    loadProduct()
  }, [productId])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // Error or product not found
  if (hasError || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Product Not Found
          </h1>
          <p className="text-muted-foreground mb-4">
            The product you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate(`/store/${storeUrl}`)}>
            Back to Store
          </Button>
        </div>
      </div>
    )
  }

  // Check if current user is the seller
  const isOwnProduct =
    isAuthenticated &&
    user &&
    product &&
    user.email.toLowerCase() === product.seller.email.toLowerCase()

  // Calculate discount
  const originalPrice = product.originalPrice
  const hasDiscount = originalPrice && originalPrice > product.price
  const discountPercent = hasDiscount && originalPrice
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0

  // Render delivery specific content
  const renderDeliveryInfo = () => {
    switch (product.deliveryType) {
      case "external_link":
        return (
          <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                  <ExternalLink className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    External Access
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    After purchase, you will be redirected to access this product externally.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case "manual":
        return (
          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Manual Delivery
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    This is a manually delivered product. After purchase, you will receive contact details to connect with the seller.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      default: // download
        return (
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Instant Download
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Download immediately after purchase via email and dashboard.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(`/store/${storeUrl}`)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Button>
          <h1 className="font-semibold text-foreground">
            {product.seller.name}
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Share2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Heart className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="relative aspect-[4/3] bg-muted rounded-2xl overflow-hidden">
              {product.thumbnailUrl ? (
                <img
                  src={product.thumbnailUrl}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-24 h-24 text-muted-foreground" />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {product.subscriptionDuration && (
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    {product.subscriptionDuration} Subscription
                  </span>
                )}
                {product.deliveryType === 'download' && (
                  <span className="bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    Instant Download
                  </span>
                )}
                {hasDiscount && (
                  <span className="bg-destructive text-destructive-foreground text-xs font-medium px-3 py-1 rounded-full">
                    Sale
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Side - Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Price Card */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-bold text-foreground">
                          {formatINR(product.price)}
                        </span>
                        {hasDiscount && originalPrice && (
                          <span className="text-lg text-muted-foreground line-through decoration-destructive/50 decoration-2">
                            {formatINR(originalPrice)}
                          </span>
                        )}
                      </div>
                      {hasDiscount && originalPrice && (
                         <span className="text-sm font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded">
                           Save ₹{originalPrice - product.price} ({discountPercent}% OFF)
                         </span>
                      )}
                    </div>
                  </div>

                  {!isOwnProduct && (
                    <Button
                      className="w-full h-12 text-base gap-2"
                      size="lg"
                      onClick={() => navigate(`/checkout/${product.id}`)}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Buy Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Seller Info Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold"
                    >
                      {product.seller.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {product.seller.name}
                      </p>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 text-warning fill-warning" />
                        <span className="font-medium">4.8</span>
                      </div>
                    </div>
                  </div>
                  <Link to={`/store/${product.seller.storeUrl}`}>
                    <Button variant="outline" size="sm">
                      View Store
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Product Details Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 space-y-6"
        >
          {/* Title and Stats */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-3">
              {product.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-warning fill-warning" />
                <span className="font-medium">4.8</span>
                <span>(78 reviews)</span>
              </div>
              <span>•</span>
              <span>234 sales</span>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Description
            </h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {product.description || "No description provided."}
            </p>
          </div>

          {/* Delivery Feature Card */}
          {renderDeliveryInfo()}
        </motion.div>
      </div>
    </div>
  )
}
