"use client"

import { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Users, Package, ShoppingCart, Search, Filter,
  ArrowUpDown, Instagram, Twitter, Youtube, Globe, Loader2,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useGetPublicStorefrontQuery } from "@/store/api/storefrontApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Category = "all" | "ebook" | "template" | "app" | "course" | "graphics" | "audio" | "other"

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
  { value: "0-500", label: "Under ₹500" },
  { value: "500-1000", label: "₹500 – ₹1,000" },
  { value: "1000-2500", label: "₹1,000 – ₹2,500" },
  { value: "2500+", label: "Above ₹2,500" },
]

const sortOptions = [
  { value: "popular", label: "Most Popular" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "rating", label: "Top Rated" },
]

const formatINR = (n: number | string) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(Number(n))

export default function PublicStorefrontPage() {
  const params = useParams<{ storeUrl: string }>()
  const { data: session } = useSession()
  const { data, isLoading, isError } = useGetPublicStorefrontQuery(params.storeUrl)

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<Category>("all")
  const [priceRange, setPriceRange] = useState("all")
  const [sortBy, setSortBy] = useState("popular")
  const [discountOnly, setDiscountOnly] = useState(false)

  // API returns storefront fields spread at root level with seller and products alongside
  const storefront = data ? (data as any) : null
  const products: any[] = (data as any)?.products ?? []

  const themeId = storefront?.themeId ?? "modern"
  const themeColor = storefront?.primaryColor ?? "#073f7c"
  const fontFamily = storefront?.fontFamily ?? "Inter"

  const getThemeBg = () => {
    if (themeId === "minimal") return "#f8fafc"
    return themeColor
  }
  const themeBg = getThemeBg()
  const isLight = themeId === "minimal"

  // isOwnStore — hide buy button if viewer owns this store
  const isOwnStore = !!(session?.user as any)?.storeUrl && (session?.user as any)?.storeUrl === params.storeUrl

  const filteredProducts = useMemo(() => {
    let list = products.map((p) => ({ ...p, hasDiscount: p.originalPrice && Number(p.originalPrice) > Number(p.price) }))

    if (search) {
      const q = search.toLowerCase()
      list = list.filter((p) => p.title.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q))
    }
    if (category !== "all") list = list.filter((p) => p.category === category)
    if (priceRange !== "all") {
      if (priceRange === "2500+") {
        list = list.filter((p) => Number(p.price) >= 2500)
      } else {
        const [min, max] = priceRange.split("-").map(Number)
        list = list.filter((p) => Number(p.price) >= min && Number(p.price) <= max)
      }
    }
    if (discountOnly) list = list.filter((p) => p.hasDiscount)

    switch (sortBy) {
      case "price-low": list.sort((a, b) => Number(a.price) - Number(b.price)); break
      case "price-high": list.sort((a, b) => Number(b.price) - Number(a.price)); break
      case "newest": list.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()); break
      case "rating": list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break
      default: list.sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0))
    }
    return list
  }, [products, search, category, priceRange, sortBy, discountOnly])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError || !storefront) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Store Not Found</h1>
          <p className="text-muted-foreground mb-4">The store you&apos;re looking for doesn&apos;t exist.</p>
          <Button asChild><Link href="/">Go Home</Link></Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily }}>
      {/* Header / Cover */}
      <div style={{ backgroundColor: themeBg }}>
        {/* Cover Image */}
        <div
          className="h-48 md:h-64 relative"
          style={{
            background: storefront.coverImageUrl
              ? `url(${storefront.coverImageUrl}) center/cover`
              : `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>

        {/* Profile Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
            {/* Profile Image */}
            <div className="relative -top-10">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-background overflow-hidden shrink-0"
                style={{ backgroundColor: themeColor }}
              >
                {storefront.profileImageUrl ? (
                  <Image src={storefront.profileImageUrl} alt={storefront.storeName ?? ""} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {(storefront.storeName ?? "G").charAt(0)}
                    </span>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left pb-4">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: isLight ? "#1f2937" : "#f9fafb" }}
              >
                {storefront.storeName}
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                style={{ color: isLight ? "#6b7280" : "#d1d5db" }}
                className="mt-1"
              >
                {storefront.tagline || storefront.description || `Digital products by ${storefront.storeName}`}
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center sm:justify-start gap-6 mt-3 text-sm"
                style={{ color: isLight ? "#6b7280" : "#d1d5db" }}
              >
                {(storefront.seller?.totalSales ?? 0) > 0 && (
                  <div className="flex items-center gap-1">
                    <ShoppingCart className="w-4 h-4" />
                    <span>{storefront.seller.totalSales} sales</span>
                  </div>
                )}
                {(storefront.seller?.followersCount ?? 0) > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{storefront.seller.followersCount} followers</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  <span>{products.length} products</span>
                </div>
              </motion.div>

              {/* Social Links */}
              {(storefront.socialInstagram || storefront.socialTwitter || storefront.socialYoutube || storefront.socialWebsite) && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-center sm:justify-start gap-3 mt-4"
                >
                  {storefront.socialInstagram && (
                    <a href={`https://instagram.com/${storefront.socialInstagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {storefront.socialTwitter && (
                    <a href={`https://twitter.com/${storefront.socialTwitter.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {storefront.socialYoutube && (
                    <a href={storefront.socialYoutube} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                      <Youtube className="w-4 h-4" />
                    </a>
                  )}
                  {storefront.socialWebsite && (
                    <a href={storefront.socialWebsite} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Products */}
      <div style={{ backgroundColor: themeBg }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* Filters */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 mb-6"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>

            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                {priceRanges.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
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
                <DropdownMenuCheckboxItem checked={discountOnly} onCheckedChange={setDiscountOnly}>
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
                {sortOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
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
                <Link key={product.id} href={`/store/${params.storeUrl}/product/${product.id}`} className="block">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.05 * index }}
                    className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {product.thumbnailUrl ? (
                        <Image
                          src={product.thumbnailUrl}
                          alt={product.title}
                          fill
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
                      {product.isFeatured && (
                        <span className="absolute top-3 right-3 bg-yellow-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">{product.rating ?? 0}</span>
                        <span className="text-sm text-muted-foreground">({product.reviewCount ?? 0} reviews)</span>
                      </div>
                      <h3 className="font-semibold line-clamp-1 mb-1">{product.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold">{formatINR(product.price)}</span>
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
                              color: parseInt(themeColor.replace("#", ""), 16) > 0xffffff / 2 ? "#1f2937" : "#ffffff",
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
              <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by{" "}
            <Link href="/" className="font-semibold text-primary hover:underline">
              GenZaic
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
