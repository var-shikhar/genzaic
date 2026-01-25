import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2 } from "lucide-react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/ui/file-upload"
import { productsAPI } from "@/lib/api/products"
import { toast } from "sonner"

export default function NewProductPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    seoTitle: "",
    seoKeywords: "",
  })
  const [files, setFiles] = useState({
    productFile: null as File | null,
    thumbnail: null as File | null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.price) {
      toast.error("Please fill in title and price")
      return
    }

    if (!files.productFile) {
      toast.error("Please upload a product file")
      return
    }

    try {
      setIsSubmitting(true)
      await productsAPI.createProduct(
        {
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          seoTitle: formData.seoTitle || undefined,
          seoKeywords: formData.seoKeywords || undefined,
          isActive: true,
        },
        files
      )

      toast.success("Product created successfully!")
      navigate("/dashboard/products")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create product"
      toast.error(message)
      console.error("Error creating product:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Add New Product
            </h1>
            <p className="text-muted-foreground mt-1">
              Upload your digital product and set pricing
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
            {/* Product Details */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                Product Details
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Title */}
                <div className="md:col-span-2">
                  <Label htmlFor="title">
                    Product Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Premium UI Kit for Web Apps"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what makes your product valuable..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                {/* Price */}
                <div>
                  <Label htmlFor="price">
                    Price (₹) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="2999"
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {/* File Uploads */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Files</h2>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Product File */}
                <div>
                  <Label>
                    Product File <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload the file buyers will receive
                  </p>
                  <FileUpload
                    accept=".pdf,.zip,.rar,.7z,application/pdf,application/zip"
                    onChange={(file) =>
                      setFiles({ ...files, productFile: file })
                    }
                    value={files.productFile}
                    label="Upload product file (PDF, ZIP, etc.)"
                    maxSize={10}
                    preview={false}
                  />
                </div>

                {/* Thumbnail */}
                <div>
                  <Label>Product Thumbnail</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Preview image for your product
                  </p>
                  <FileUpload
                    accept="image/*"
                    onChange={(file) => setFiles({ ...files, thumbnail: file })}
                    value={files.thumbnail}
                    label="Upload thumbnail image"
                    maxSize={10}
                    preview={true}
                  />
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                SEO (Optional)
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                {/* SEO Title */}
                <div>
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    placeholder="Optimized title for search engines"
                    value={formData.seoTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, seoTitle: e.target.value })
                    }
                  />
                </div>

                {/* SEO Keywords */}
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
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link to="/dashboard/products">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 hover:opacity-90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </DashboardLayout>
  )
}
