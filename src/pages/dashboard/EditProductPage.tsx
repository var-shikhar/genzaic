import React, { useState, useEffect } from "react"
import { useNavigate, Link, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2 } from "lucide-react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/ui/file-upload"
import { productsAPI, type Product } from "@/lib/api/products"
import { toast } from "sonner"

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
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
      setFormData({
        title: productData.title,
        description: productData.description || "",
        price: productData.price.toString(),
        seoTitle: productData.seoTitle || "",
        seoKeywords: productData.seoKeywords || "",
        isActive: productData.isActive,
      })
    } catch (error) {
      toast.error("Failed to load product")
      console.error("Error loading product:", error)
      navigate("/dashboard/products")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.price) {
      toast.error("Please fill in title and price")
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

                {/* Status */}
                <div>
                  <Label htmlFor="isActive">Status</Label>
                  <select
                    id="isActive"
                    value={formData.isActive ? "active" : "inactive"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isActive: e.target.value === "active",
                      })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Current Files */}
            {product && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Current Files
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {product.fileUrl && (
                    <div className="p-4 rounded-lg border border-border bg-muted/50">
                      <p className="text-sm font-medium text-foreground mb-1">
                        Product File
                      </p>
                      <a
                        href={product.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        View current file
                      </a>
                    </div>
                  )}
                  {product.thumbnailUrl && (
                    <div className="p-4 rounded-lg border border-border bg-muted/50">
                      <p className="text-sm font-medium text-foreground mb-2">
                        Thumbnail
                      </p>
                      <img
                        src={product.thumbnailUrl}
                        alt="Current thumbnail"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Update Files */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                Update Files (Optional)
              </h2>
              <p className="text-sm text-muted-foreground">
                Upload new files to replace the current ones. Leave empty to
                keep existing files.
              </p>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Product File */}
                <div>
                  <Label>New Product File</Label>
                  <FileUpload
                    accept=".pdf,.zip,.rar,.7z,application/pdf,application/zip"
                    onChange={(file) =>
                      setFiles({ ...files, productFile: file })
                    }
                    value={files.productFile}
                    label="Upload new product file"
                    maxSize={100}
                    preview={false}
                  />
                </div>

                {/* Thumbnail */}
                <div>
                  <Label>New Thumbnail</Label>
                  <FileUpload
                    accept="image/*"
                    onChange={(file) => setFiles({ ...files, thumbnail: file })}
                    value={files.thumbnail}
                    label="Upload new thumbnail"
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
                  Updating...
                </>
              ) : (
                "Update Product"
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </DashboardLayout>
  )
}
