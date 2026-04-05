"use client"

import { useGetProductQuery } from "@/store/api/productsApi"
import { ProductForm } from "@/components/dashboard/ProductForm"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditProductPage({ params }: { params: { id: string } }) {
  const { data: product, isLoading } = useGetProductQuery(params.id)

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

  return <ProductForm mode="edit" product={product} />
}
