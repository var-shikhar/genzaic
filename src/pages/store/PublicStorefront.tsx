import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star,
  Users,
  Package,
  ShoppingCart,
  Search,
  Filter,
  ChevronDown,
  ExternalLink,
  Instagram,
  Twitter,
  Youtube,
  Globe,
  ArrowUpDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mockProducts, mockCurrentUser, formatINR, ProductCategory } from '@/lib/mockData';

const categories: { value: ProductCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'ebook', label: 'eBooks' },
  { value: 'template', label: 'Templates' },
  { value: 'app', label: 'Apps' },
  { value: 'course', label: 'Courses' },
  { value: 'graphics', label: 'Graphics' },
  { value: 'audio', label: 'Audio' },
  { value: 'other', label: 'Other' },
];

const priceRanges = [
  { value: 'all', label: 'All Prices' },
  { value: '0-500', label: 'Under ₹500' },
  { value: '500-1000', label: '₹500 - ₹1,000' },
  { value: '1000-2500', label: '₹1,000 - ₹2,500' },
  { value: '2500+', label: 'Above ₹2,500' },
];

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Top Rated' },
];

export default function PublicStorefront() {
  const { storeUrl } = useParams<{ storeUrl: string }>();
  
  // In production, you'd fetch this based on storeUrl
  const store = mockCurrentUser;
  const allProducts = mockProducts.filter(p => p.status === 'published');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showDiscountOnly, setShowDiscountOnly] = useState(false);

  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    // Search filter
    if (searchQuery) {
      products = products.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      products = products.filter(p => p.category === selectedCategory);
    }

    // Price range filter
    if (selectedPriceRange !== 'all') {
      const [min, max] = selectedPriceRange.split('-').map(v => v === '+' ? Infinity : parseInt(v));
      if (max) {
        products = products.filter(p => p.price >= (min || 0) && p.price <= max);
      } else {
        products = products.filter(p => p.price >= min);
      }
    }

    // Discount filter
    if (showDiscountOnly) {
      products = products.filter(p => p.hasDiscount);
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'rating':
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default: // popular
        products.sort((a, b) => b.downloads - a.downloads);
    }

    return products;
  }, [allProducts, searchQuery, selectedCategory, selectedPriceRange, sortBy, showDiscountOnly]);

  const themeColor = store.storefrontSettings?.primaryColor || '#073f7c';

  return (
    <div className="min-h-screen bg-background">
      {/* Header / Cover */}
      <div className="relative">
        {/* Cover Image */}
        <div 
          className="h-48 md:h-64 relative"
          style={{ 
            background: store.storefrontSettings?.coverImage 
              ? `url(${store.storefrontSettings.coverImage}) center/cover`
              : `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>

        {/* Profile Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-16 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
            {/* Profile Image */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-background overflow-hidden flex-shrink-0"
              style={{ backgroundColor: themeColor }}
            >
              {store.storefrontSettings?.profileImage ? (
                <img 
                  src={store.storefrontSettings.profileImage} 
                  alt={store.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {store.name?.charAt(0) || 'G'}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Store Info */}
            <div className="flex-1 text-center sm:text-left pb-4">
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-2xl sm:text-3xl font-bold text-foreground"
              >
                {store.name}
              </motion.h1>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground mt-1"
              >
                {store.storefrontSettings?.tagline || `Digital products by ${store.name}`}
              </motion.p>
              
              {/* Stats */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center sm:justify-start gap-6 mt-3 text-sm"
              >
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-warning fill-warning" />
                  <span className="font-medium">{store.rating || 4.8}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{store.followers || 125} followers</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Package className="w-4 h-4" />
                  <span>{allProducts.length} products</span>
                </div>
              </motion.div>

              {/* Social Links */}
              {store.storefrontSettings?.socialLinks && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-center sm:justify-start gap-3 mt-4"
                >
                  {store.storefrontSettings.socialLinks.instagram && (
                    <a 
                      href={`https://instagram.com/${store.storefrontSettings.socialLinks.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {store.storefrontSettings.socialLinks.twitter && (
                    <a 
                      href={`https://twitter.com/${store.storefrontSettings.socialLinks.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {store.storefrontSettings.socialLinks.youtube && (
                    <a 
                      href={store.storefrontSettings.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <Youtube className="w-4 h-4" />
                    </a>
                  )}
                  {store.storefrontSettings.socialLinks.website && (
                    <a 
                      href={store.storefrontSettings.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                    >
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Filters Bar */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as ProductCategory | 'all')}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Price Filter */}
          <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              {priceRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* More Filters */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={showDiscountOnly}
                onCheckedChange={setShowDiscountOnly}
              >
                Discounted Only
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredProducts.length} of {allProducts.length} products
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all group"
              >
                {/* Product Image */}
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {product.thumbnailUrl ? (
                    <img 
                      src={product.thumbnailUrl} 
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                    <span className="absolute top-3 right-3 bg-warning text-warning-foreground text-xs font-medium px-2.5 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 text-warning fill-warning" />
                    <span className="text-sm font-medium">{product.rating || 0}</span>
                    <span className="text-sm text-muted-foreground">
                      ({product.reviewCount || 0} reviews)
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
                    {product.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-foreground">
                        {formatINR(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through ml-2">
                          {formatINR(product.originalPrice)}
                        </span>
                      )}
                    </div>
                    <Button 
                      size="sm"
                      className="gap-1"
                      style={{ 
                        backgroundColor: themeColor,
                        color: parseInt(themeColor.replace('#', ''), 16) > 0xffffff / 2 ? '#1f2937' : '#ffffff'
                      }}
                      onClick={() => window.location.href = `/checkout/${product.id}`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Buy
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by{' '}
            <Link to="/" className="font-semibold text-primary hover:underline">
              GenZaic
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
