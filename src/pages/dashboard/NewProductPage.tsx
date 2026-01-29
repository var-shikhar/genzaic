import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { productsAPI } from "@/lib/api/products"
import { toast } from "sonner"
import { ProductForm } from "@/components/dashboard/ProductForm"

export default function NewProductPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: any, files: any) => {
    try {
      setIsSubmitting(true)
      await productsAPI.createProduct(data, files)

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
              Create a new digital product for your store
            </p>
          </div>
        </div>

        <ProductForm 
            mode="create"
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
        />
      </motion.div>
    </DashboardLayout>
  )
}
