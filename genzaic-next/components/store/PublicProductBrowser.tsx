"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
import {
  ArrowUpDown,
  Filter,
  Package,
  Search,
  ShoppingCart,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import type { PublicStorefrontPayload } from "@/lib/data/public-storefront"

type Category =
  | "all"
  | "ebook"
  | "template"
  | "app"
  | "course"
  | "graphics"
  | "audio"
  | "other"

const categories: { value: Category; label: string }[] = [
  { value: "all", label: "All Categories" },
  { value: "ebook", label: "eBooks" },
  { value: "template", label: "Templates" },
  { value: "app", label: "Apps" },
  { value: "course", label: "Courses" },
  { value: "graphics", label: "Graphics" },
  { value: "audio", label: "Audio" },
  { value: "other", label: "Other" },
]

const priceRanges = [
  { value: "all", label: "All Prices" },
  { value: "0-500", label: "Under \u20B9500" },
  { value: "500-1000", label: "\u20B9500 \u2013 \u20B91,000" },
  { value: "1000-2500", label: "\u20B91,000 \u2013 \u20B92,500" },
  { value: "2500+", label: "Above \u20B92,500" },
]

const sortOptions = [
  { value: "popular", label: "Most Popular" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "rating", label: "Top Rated" },
]

const formatINR = (n: number | string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(Number(n))

interface PublicProductBrowserProps {
  storeUrl: string
  themeColor: string
  products: PublicStorefrontPayload["products"]
}

export default function PublicProductBrowser({
  storeUrl,
  themeColor,
  products,
}: PublicProductBrowserProps) {
  // Determine ownership client-side so the page itself can stay statically
  // generated. Done with `useSession()` rather than `auth()` in the parent.
  const { data: session } = useSession()
  const userWithStore = session?.user as { storeUrl?: string | null } | undefined
  const isOwnStore =
    !!userWithStore?.storeUrl && userWithStore.storeUrl === storeUrl

  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 200)
  const [category, setCategory] = useState<Category>("all")
  const [priceRange, setPriceRange] = useState("all")
  const [sortBy, setSortBy] = useState("popular")
  const [discountOnly, setDiscountOnly] = useState(false)

  const filteredProducts = useMemo(() => {
    let list = products.map((p) => ({
      ...p,
      hasDiscount:
        p.originalPrice && Number(p.originalPrice) > Number(p.price),
    }))

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q),
      )
    }
    if (category !== "all") list = list.filter((p) => p.categoryId === category)
    if (priceRange !== "all") {
      if (priceRange === "2500+") {
        list = list.filter((p) => Number(p.price) >= 2500)
      } else {
        const [min, max] = priceRange.split("-").map(Number)
        list = list.filter(
          (p) => Number(p.price) >= min && Number(p.price) <= max,
        )
      }
    }
    if (discountOnly) list = list.filter((p) => p.hasDiscount)

    switch (sortBy) {
      case "price-low":
        list.sort((a, b) => Number(a.price) - Number(b.price))
        break
      case "price-high":
        list.sort((a, b) => Number(b.price) - Number(a.price))
        break
      case "newest":
        list.sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime(),
        )
        break
      case "rating":
        list.sort(
          (a, b) => Number(b.avgRating ?? 0) - Number(a.avgRating ?? 0),
        )
        break
      default:
        list.sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0))
    }
    return list
  }, [products, debouncedSearch, category, priceRange, sortBy, discountOnly])

  return (
    <>
      {/* Filters */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={category}
          onValueChange={(v) => setCategory(v as Category)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Price" />
          </SelectTrigger>
          <SelectContent>
            {priceRanges.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              checked={discountOnly}
              onCheckedChange={setDiscountOnly}
            >
              Discounted Only
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground mb-6">
        Showing {filteredProducts.length} of {products.length} products
      </p>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filteredProducts.map((product, index) => (
            <Link
              key={product.id}
              href={`/store/${storeUrl}/product/${product.id}`}
              className="block"
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.05 * index }}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {product.coverImageUrl ? (
                    <Image
                      src={product.coverImageUrl}
                      alt={product.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  {product.hasDiscount && (
                    <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-medium px-2.5 py-1 rounded-full">
                      Sale
                    </span>
                  )}
                  {Number(product.avgRating) >= 4.5 && (
                    <span className="absolute top-3 right-3 bg-yellow-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                      Top Rated
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">
                      {product.avgRating ?? 0}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({product.totalReviews ?? 0} reviews)
                    </span>
                  </div>
                  <h3 className="font-semibold line-clamp-1 mb-1">
                    {product.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold">
                        {formatINR(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through ml-2">
                          {formatINR(product.originalPrice)}
                        </span>
                      )}
                    </div>
                    {!isOwnStore && (
                      <Button
                        size="sm"
                        className="gap-1"
                        style={{
                          backgroundColor: themeColor,
                          color:
                            parseInt(themeColor.replace("#", ""), 16) >
                            0xffffff / 2
                              ? "#1f2937"
                              : "#ffffff",
                        }}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          window.location.href = `/checkout/${product.id}`
                        }}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Buy
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-16">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search query.
          </p>
        </div>
      )}
    </>
  )
}
