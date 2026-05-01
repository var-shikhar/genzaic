"use client"

import { useParams } from "next/navigation"
import { useProduct } from "@/lib/queries/products"
import { ProductForm } from "@/components/dashboard/ProductForm"
import { Breadcrumbs } from "@/components/layout/Breadcrumbs"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const { data: product, isLoading } = useProduct(id)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Product not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Products", href: "/dashboard/products" },
          { label: product.title },
        ]}
      />
      <ProductForm product={product} />
    </div>
  )
}
