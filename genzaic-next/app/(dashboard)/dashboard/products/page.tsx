"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import { Plus, Search, Edit, Trash2, Package, LayoutGrid, List as ListIcon } from "lucide-react"
import { useProducts, useDeleteProduct, useToggleProductStatus } from "@/lib/queries/products"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { getApiErrorMessage } from "@/lib/api-error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { formatCurrency } from "@/lib/utils"
import { useConfirm } from "@/lib/react/confirm"
import { QuickAddProductModal } from "@/components/dashboard/QuickAddProductModal"
import { cn } from "@/lib/utils"

type ViewMode = "grid" | "list"

export default function ProductsPage() {
  const [search, setSearch] = useState("")
  const [page] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const debouncedSearch = useDebouncedValue(search, 300)
  const { data, isLoading } = useProducts({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
  })
  const { mutateAsync: deleteProduct } = useDeleteProduct()
  const { mutateAsync: toggleStatus } = useToggleProductStatus()
  const confirm = useConfirm()
  const [addOpen, setAddOpen] = useState(false)

  const handleDelete = async (id: string, title: string) => {
    const ok = await confirm({
      title: "Delete product?",
      description: `This will permanently delete "${title}". This action cannot be undone.`,
      confirmText: "Delete",
      danger: true,
    })
    if (!ok) return
    try {
      await deleteProduct(id)
      toast.success("Product deleted")
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to delete product"))
    }
  }

  const handleToggle = async (id: string, nextActive: boolean) => {
    try {
      await toggleStatus(id)
      toast.success(nextActive ? "Product published" : "Product unpublished")
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update status"))
    }
  }

  const products = data?.products ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">{data?.total ?? 0} products total</p>
        </div>
        <Button className="gradient-primary text-white gap-2" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="ml-auto inline-flex items-center rounded-lg border bg-card p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            aria-label="List view"
            className={cn(
              "p-1.5 rounded-md transition-colors",
              viewMode === "list"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <ListIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
            className={cn(
              "p-1.5 rounded-md transition-colors",
              viewMode === "grid"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className={viewMode === "grid" ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" : "grid gap-3"}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className={viewMode === "grid" ? "h-56 w-full" : "h-24 w-full"} />
          ))}
        </div>
      ) : !products.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No products yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Create your first product to start selling</p>
            <Button className="gradient-primary text-white gap-2" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "list" ? (
        <div className="grid gap-3">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 p-4">
                  {product.coverImageUrl ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                      <Image src={product.coverImageUrl} alt={product.title} fill className="object-cover" />
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
                      <Link href={`/dashboard/products/${product.slug ?? product.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(product.id, product.title)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <Link href={`/dashboard/products/${product.slug ?? product.id}/edit`} className="block">
                <div className="aspect-video bg-muted relative">
                  {product.coverImageUrl ? (
                    <Image
                      src={product.coverImageUrl}
                      alt={product.title}
                      fill
                      sizes="240px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-10 w-10 text-muted-foreground/40" />
                    </div>
                  )}
                  {!product.isActive && (
                    <Badge className="absolute top-2 left-2" variant="secondary">
                      Draft
                    </Badge>
                  )}
                </div>
              </Link>
              <CardContent className="p-3 space-y-2">
                <p className="font-medium text-sm truncate">{product.title}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{formatCurrency(product.price)}</span>
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {product.deliveryType}
                  </Badge>
                </div>
                <div className="flex items-center justify-between border-t pt-2">
                  <Switch
                    checked={product.isActive}
                    onCheckedChange={(next) => handleToggle(product.id, next)}
                  />
                  <div className="flex items-center gap-1">
                    <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                      <Link href={`/dashboard/products/${product.slug ?? product.id}/edit`}>
                        <Edit className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(product.id, product.title)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <QuickAddProductModal open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
