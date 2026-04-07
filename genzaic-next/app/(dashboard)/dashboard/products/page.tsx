"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import { Plus, Search, Edit, Trash2, Package } from "lucide-react"
import { useGetProductsQuery, useDeleteProductMutation, useToggleProductStatusMutation } from "@/store/api/productsApi"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function ProductsPage() {
  const [search, setSearch] = useState("")
  const [page] = useState(1)
  const debouncedSearch = useDebouncedValue(search, 300)
  const { data, isLoading } = useGetProductsQuery({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
  })
  const [deleteProduct] = useDeleteProductMutation()
  const [toggleStatus] = useToggleProductStatusMutation()

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id).unwrap()
      toast.success("Product deleted")
    } catch {
      toast.error("Failed to delete product")
    }
  }

  const handleToggle = async (id: string, nextActive: boolean) => {
    try {
      await toggleStatus(id).unwrap()
      toast.success(nextActive ? "Product published" : "Product unpublished")
    } catch {
      toast.error("Failed to update status")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">{data?.total ?? 0} products total</p>
        </div>
        <Button asChild className="gradient-primary text-white gap-2">
          <Link href="/dashboard/products/new">
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : !data?.products.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No products yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Create your first product to start selling</p>
            <Button asChild className="gradient-primary text-white gap-2">
              <Link href="/dashboard/products/new">
                <Plus className="h-4 w-4" /> Add Product
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {data.products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 p-4">
                  {product.thumbnailUrl ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                      <Image src={product.thumbnailUrl} alt={product.title} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-semibold">{formatCurrency(product.price)}</span>
                      <Badge variant="outline" className="text-xs">{product.deliveryType}</Badge>
                      <span className="text-xs text-muted-foreground">{product.downloads} downloads</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Switch
                      checked={product.isActive}
                      onCheckedChange={(next) => handleToggle(product.id, next)}
                    />
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/dashboard/products/${product.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete product?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete &ldquo;{product.title}&rdquo;. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(product.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
