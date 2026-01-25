import React, { useState, useEffect } from "react"
import { useNavigate, Link, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, Sparkles, Package, Upload, Link2, Mail, AlertCircle } from "lucide-react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/ui/file-upload"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AIExtractionModal } from "@/components/dashboard/AIExtractionModal"
import { DeliveryTypeSelector, DeliveryType } from "@/components/dashboard/DeliveryTypeSelector"
import { productsAPI, type Product } from "@/lib/api/products"
import { ExtractedProduct } from "@/lib/api/ai"
import { toast } from "sonner"

const subscriptionDurations = [
  { value: "", label: "Not a subscription" },
  { value: "1 month", label: "1 Month" },
  { value: "3 months", label: "3 Months" },
  { value: "6 months", label: "6 Months" },
  { value: "1 year", label: "1 Year" },
  { value: "lifetime", label: "Lifetime" },
]

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    originalPrice: "",
    deliveryType: "download" as DeliveryType,
    externalUrl: "",
    sellerContactEmail: "",
    sellerContactPhone: "",
    sellerContactWhatsapp: "",
    subscriptionDuration: "",
    seoTitle: "",
    seoKeywords: "",
    isActive: true,
  })
  
  const [files, setFiles] = useState({
    productFile: null as File | null,
    thumbnail: null as File | null,
  })

  useEffect(() => {
    if (id) {
      loadProduct()
    }
  }, [id])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const response = await productsAPI.getProductById(id!)
      const productData = response.data
      setProduct(productData)
      
      // Ensure all fields are correctly populated, handling nulls
      setFormData({
        title: productData.title || "",
        description: productData.description || "",
        price: productData.price?.toString() || "",
        originalPrice: productData.originalPrice?.toString() || "",
        deliveryType: (productData.deliveryType as DeliveryType) || "download",
        externalUrl: productData.externalUrl || "",
        sellerContactEmail: productData.sellerContactEmail || "",
        sellerContactPhone: productData.sellerContactPhone || "",
        sellerContactWhatsapp: productData.sellerContactWhatsapp || "",
        subscriptionDuration: productData.subscriptionDuration || "",
        seoTitle: productData.seoTitle || "",
        seoKeywords: productData.seoKeywords || "",
        isActive: productData.isActive,
      })
      
      console.log("Product loaded:", productData);
    } catch (error) {
      toast.error("Failed to load product")
      console.error("Error loading product:", error)
      navigate("/dashboard/products")
    } finally {
      setLoading(false)
    }
  }

  const handleUseExtractedProduct = (extractedProduct: ExtractedProduct) => {
    setFormData((prev) => ({
      ...prev,
      title: extractedProduct.title || prev.title,
      description: extractedProduct.description || prev.description,
      price: extractedProduct.price?.toString() || prev.price,
      originalPrice: extractedProduct.originalPrice?.toString() || prev.originalPrice,
      subscriptionDuration: extractedProduct.subscriptionDuration || prev.subscriptionDuration,
      deliveryType: extractedProduct.subscriptionDuration ? "manual" : prev.deliveryType,
    }))
    
    toast.success("Product details filled from AI extraction!")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.price) {
      toast.error("Please fill in title and price")
      return
    }

    // Validate based on delivery type
    if (formData.deliveryType === "external_link" && !formData.externalUrl && !product?.externalUrl) {
      toast.error("Please provide an external URL for the product")
      return
    }

    if (formData.deliveryType === "manual" && !formData.sellerContactEmail && !product?.sellerContactEmail) {
      toast.error("Please provide at least an email for buyers to contact you")
      return
    }

    try {
      setIsSubmitting(true)
      await productsAPI.updateProduct(
        id!,
        {
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
          deliveryType: formData.deliveryType,
          externalUrl: formData.externalUrl || undefined,
          sellerContactEmail: formData.sellerContactEmail || undefined,
          sellerContactPhone: formData.sellerContactPhone || undefined,
          sellerContactWhatsapp: formData.sellerContactWhatsapp || undefined,
          subscriptionDuration: formData.subscriptionDuration || undefined,
          seoTitle: formData.seoTitle || undefined,
          seoKeywords: formData.seoKeywords || undefined,
          isActive: formData.isActive,
        },
        files
      )

      toast.success("Product updated successfully!")
      navigate("/dashboard/products")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update product"
      toast.error(message)
      console.error("Error updating product:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard/products">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Edit Product</h1>
              <p className="text-muted-foreground mt-1">
                Update your product details
              </p>
            </div>
          </div>
          
          {/* AI Quick Import Button */}
          <Button
            type="button"
            onClick={() => setShowAIModal(true)}
            className="bg-primary hover:opacity-90"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Quick Import with AI
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Delivery Type Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-success" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Delivery Method</h2>
                <p className="text-sm text-muted-foreground">How will buyers receive this product?</p>
              </div>
            </div>

            <DeliveryTypeSelector
              value={formData.deliveryType}
              onChange={(value) => setFormData({ ...formData, deliveryType: value })}
            />
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Product Details</h2>
                <p className="text-sm text-muted-foreground">Basic information about your product</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="title">
                  Product Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Ultimate UI Kit for Figma"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what's included in your product..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              {/* Price & Original Price */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="price">
                    Your Price (₹) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="499"
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="originalPrice">Original Price (₹)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    placeholder="999 (optional, for showing discount)"
                    min="0"
                    step="1"
                    value={formData.originalPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, originalPrice: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Subscription Duration */}
              <div>
                <Label htmlFor="subscriptionDuration">Subscription Duration</Label>
                <Select
                  value={formData.subscriptionDuration}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subscriptionDuration: value === "none" ? "" : value })
                  }
                >
                  <SelectTrigger id="subscriptionDuration">
                    <SelectValue placeholder="Select if this is a subscription" />
                  </SelectTrigger>
                  <SelectContent>
                    {subscriptionDurations.map((duration) => (
                      <SelectItem key={duration.value || "none"} value={duration.value || "none"}>
                        {duration.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  For subscriptions like Netflix, Spotify, SaaS tools, etc.
                </p>
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="isActive">Status</Label>
                <Select
                  value={formData.isActive ? "active" : "inactive"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, isActive: value === "active" })
                  }
                >
                  <SelectTrigger id="isActive">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* Conditional Fields Based on Delivery Type */}
          {formData.deliveryType === "download" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-accent-purple" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Files</h2>
                  <p className="text-sm text-muted-foreground">
                    Upload new files to replace existing ones (optional)
                  </p>
                </div>
              </div>

              {/* Current Files Display */}
              {product && (
                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-2">Current Files:</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {product.fileUrl && <p>✓ Product file uploaded</p>}
                    {product.thumbnailUrl && <p>✓ Thumbnail uploaded</p>}
                  </div>
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label>New Product File (PDF/ZIP)</Label>
                  <FileUpload
                    accept=".pdf,.zip,.rar,.7z"
                    onChange={(file) => setFiles({ ...files, productFile: file })}
                    value={files.productFile}
                    label="Upload new product file"
                    maxSize={10}
                    preview={false}
                  />
                </div>
                <div>
                  <Label>New Cover Image</Label>
                  <FileUpload
                    accept=".png,.jpg,.jpeg,.webp"
                    onChange={(file) => setFiles({ ...files, thumbnail: file })}
                    value={files.thumbnail}
                    label="Upload new thumbnail"
                    maxSize={5}
                    preview={true}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {formData.deliveryType === "external_link" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-accent-purple" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">External Link</h2>
                  <p className="text-sm text-muted-foreground">
                    Where should buyers be redirected after purchase?
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="externalUrl">
                    Product URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="externalUrl"
                    type="url"
                    placeholder="https://notion.so/your-template or https://drive.google.com/..."
                    value={formData.externalUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, externalUrl: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Buyers will see this link and be able to access it after purchase
                  </p>
                </div>
                <div>
                  <Label>New Cover Image</Label>
                  <FileUpload
                    accept=".png,.jpg,.jpeg,.webp"
                    onChange={(file) => setFiles({ ...files, thumbnail: file })}
                    value={files.thumbnail}
                    label="Upload new thumbnail"
                    maxSize={5}
                    preview={true}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {formData.deliveryType === "manual" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-accent-purple" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Contact Information</h2>
                  <p className="text-sm text-muted-foreground">
                    How should buyers reach you after purchase?
                  </p>
                </div>
              </div>

              <div className="p-4 bg-warning/10 rounded-lg border border-warning/20 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Manual Delivery</p>
                    <p className="text-muted-foreground mt-1">
                      After a buyer completes payment, they'll see your contact info and you'll receive
                      an email notification with their details.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="sellerContactEmail">
                    Contact Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="sellerContactEmail"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.sellerContactEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, sellerContactEmail: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="sellerContactPhone">Contact Phone (Optional)</Label>
                  <Input
                    id="sellerContactPhone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.sellerContactPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, sellerContactPhone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="sellerContactWhatsapp">WhatsApp Number (Optional)</Label>
                  <Input
                    id="sellerContactWhatsapp"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.sellerContactWhatsapp}
                    onChange={(e) =>
                      setFormData({ ...formData, sellerContactWhatsapp: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Buyers can click to message you on WhatsApp directly
                  </p>
                </div>
                <div>
                  <Label>New Cover Image</Label>
                  <FileUpload
                    accept=".png,.jpg,.jpeg,.webp"
                    onChange={(file) => setFiles({ ...files, thumbnail: file })}
                    value={files.thumbnail}
                    label="Upload new thumbnail"
                    maxSize={5}
                    preview={true}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* SEO Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <h2 className="font-semibold text-foreground mb-4">SEO Settings (Optional)</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  placeholder="SEO optimized title"
                  value={formData.seoTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, seoTitle: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="seoKeywords">Keywords</Label>
                <Input
                  id="seoKeywords"
                  placeholder="ui kit, design, templates"
                  value={formData.seoKeywords}
                  onChange={(e) =>
                    setFormData({ ...formData, seoKeywords: e.target.value })
                  }
                />
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/products")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:opacity-90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Product"
              )}
            </Button>
          </div>
        </form>
      </motion.div>

      {/* AI Extraction Modal */}
      <AIExtractionModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onUseProduct={handleUseExtractedProduct}
      />
    </DashboardLayout>
  )
}
