"use client"

import { useParams } from "next/navigation"
import { useProduct } from "@/lib/queries/products"
import { ProductForm } from "@/components/dashboard/ProductForm"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const { data: product, isLoading } = useProduct(id)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          <Skeleton className="h-64 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <p className="font-display italic text-muted-foreground">Product not found.</p>
      </div>
    )
  }

  return <ProductForm product={product} />
}
