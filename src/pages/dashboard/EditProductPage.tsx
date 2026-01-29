import React, { useState, useEffect } from "react"
import { useNavigate, Link, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2 } from "lucide-react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { productsAPI, type Product } from "@/lib/api/products"
import { toast } from "sonner"
import { ProductForm } from "@/components/dashboard/ProductForm"

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)

  useEffect(() => {
    if (id) {
      loadProduct()
    }
  }, [id])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const response = await productsAPI.getProductById(id!)
      setProduct(response.data)
    } catch (error) {
      toast.error("Failed to load product")
      console.error("Error loading product:", error)
      navigate("/dashboard/products")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: any, files: any) => {
    try {
      setIsSubmitting(true)
      await productsAPI.updateProduct(id!, data, files)

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

        <ProductForm 
            mode="edit"
            initialData={product}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
        />
      </motion.div>
    </DashboardLayout>
  )
}
