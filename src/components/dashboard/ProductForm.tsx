import { AIExtractionModal } from "@/components/dashboard/AIExtractionModal"
import { DeliveryType, DeliveryTypeSelector } from "@/components/dashboard/DeliveryTypeSelector"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/ui/file-upload"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ExtractedProduct } from "@/lib/api/ai"
import { Product } from "@/lib/api/products"
import { toast } from "@/lib/toast"
import { motion } from "framer-motion"
import { AlertCircle, Link2, Loader2, Mail, Package, Sparkles, Upload } from "lucide-react"
import React, { useEffect, useState } from "react"

const subscriptionDurations = [
  { value: "", label: "Not a subscription" },
  { value: "1 month", label: "1 Month" },
  { value: "3 months", label: "3 Months" },
  { value: "6 months", label: "6 Months" },
  { value: "1 year", label: "1 Year" },
  { value: "lifetime", label: "Lifetime" },
]

interface ProductFormProps {
  initialData?: Product | null
  onSubmit: (data: any, files: any) => Promise<void>
  isSubmitting: boolean
  mode: "create" | "edit"
}

export function ProductForm({ initialData, onSubmit, isSubmitting, mode }: ProductFormProps) {
  const [showAIModal, setShowAIModal] = useState(false)
  
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
    if (initialData) {
        setFormData({
            title: initialData.title || "",
            description: initialData.description || "",
            price: initialData.price?.toString() || "",
            originalPrice: initialData.originalPrice?.toString() || "",
            deliveryType: (initialData.deliveryType as DeliveryType) || "download",
            externalUrl: initialData.externalUrl || "",
            sellerContactEmail: initialData.sellerContactEmail || "",
            sellerContactPhone: initialData.sellerContactPhone || "",
            sellerContactWhatsapp: initialData.sellerContactWhatsapp || "",
            subscriptionDuration: initialData.subscriptionDuration || "",
            seoTitle: initialData.seoTitle || "",
            seoKeywords: initialData.seoKeywords || "",
            isActive: initialData.isActive ?? true,
        })
    }
  }, [initialData])

  const handleUseExtractedProduct = (product: ExtractedProduct) => {
    setFormData((prev) => ({
      ...prev,
      title: product.title || prev.title,
      description: product.description || prev.description,
      price: product.price?.toString() || prev.price,
      originalPrice: product.originalPrice?.toString() || prev.originalPrice,
      subscriptionDuration: product.subscriptionDuration || prev.subscriptionDuration,
      deliveryType: product.subscriptionDuration ? "manual" : prev.deliveryType,
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
    if (mode === "create" && formData.deliveryType === "download" && !files.productFile) {
      toast.error("Please upload a product file for digital downloads")
      return
    }

    if (formData.deliveryType === "external_link" && !formData.externalUrl && (mode === "create" || !initialData?.externalUrl)) {
      toast.error("Please provide an external URL for the product")
      return
    }

    if (formData.deliveryType === "manual" && !formData.sellerContactEmail && (mode === "create" || !initialData?.sellerContactEmail)) {
      toast.error("Please provide at least an email for buyers to contact you")
      return
    }

    await onSubmit({
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
    }, files)
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => setShowAIModal(true)}
            className="bg-primary hover:opacity-90"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Quick Import with AI
          </Button>
        </div>

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

              {/* Status - Edit Mode Only */}
              {mode === "edit" && (
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
              )}
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
                  <p className="text-sm text-muted-foreground">Upload your product files</p>
                </div>
              </div>

              {/* Current Files Display for Edit Mode */}
              {mode === "edit" && initialData && (
                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-2">Current Files:</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {initialData.fileUrl && <p>✓ Product file uploaded</p>}
                    {initialData.thumbnailUrl && <p>✓ Thumbnail uploaded</p>}
                  </div>
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label>
                    {mode === "edit" ? "New Product File" : "Product File"} (PDF/ZIP) {mode === "create" && <span className="text-destructive">*</span>}
                  </Label>
                  <FileUpload
                    accept=".pdf,.zip,.rar,.7z"
                    onChange={(file) => setFiles({ ...files, productFile: file })}
                    value={files.productFile}
                    label="Upload product file"
                    maxSize={10}
                    preview={false}
                  />
                </div>
                <div>
                  <Label>{mode === "edit" ? "New Cover Image" : "Cover Image"}</Label>
                  <FileUpload
                    accept=".png,.jpg,.jpeg,.webp"
                    onChange={(file) => setFiles({ ...files, thumbnail: file })}
                    value={files.thumbnail}
                    label="Upload thumbnail"
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
                  <Label>{mode === "edit" ? "New Cover Image" : "Cover Image"}</Label>
                  <FileUpload
                    accept=".png,.jpg,.jpeg,.webp"
                    onChange={(file) => setFiles({ ...files, thumbnail: file })}
                    value={files.thumbnail}
                    label="Upload thumbnail"
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
                      an email notification with their details. This is ideal for subscriptions,
                      consulting, or custom deliveries.
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
                  <Label>{mode === "edit" ? "New Cover Image" : "Cover Image"}</Label>
                  <FileUpload
                    accept=".png,.jpg,.jpeg,.webp"
                    onChange={(file) => setFiles({ ...files, thumbnail: file })}
                    value={files.thumbnail}
                    label="Upload thumbnail"
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
              onClick={() => window.history.back()}
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
                  {mode === "create" ? "Creating..." : "Updating..."}
                </>
              ) : (
                mode === "create" ? "Create Product" : "Update Product"
              )}
            </Button>
          </div>
        </form>

      {/* AI Extraction Modal */}
      <AIExtractionModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onUseProduct={handleUseExtractedProduct}
      />
    </div>
  )
}
