import { Skeleton } from "@/components/ui/skeleton"

// Match the product page layout closely so the skeleton-to-real transition
// doesn't shift around. Same tint as the storefront's loading state for
// consistency on mobile (where bg-muted on white nearly disappears).
const SK = "bg-muted-foreground/15"

export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Skeleton className={`h-9 w-32 ${SK}`} />
          <Skeleton className={`h-5 w-36 ${SK}`} />
          <div className="flex items-center gap-2">
            <Skeleton className={`h-9 w-9 rounded-md ${SK}`} />
            <Skeleton className={`h-9 w-9 rounded-md ${SK}`} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left — hero + gallery strip */}
          <div className="space-y-3">
            <Skeleton
              className={`relative aspect-[4/3] rounded-2xl ${SK} animate-pulse`}
            />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className={`relative aspect-square rounded-md ${SK}`}
                />
              ))}
            </div>
          </div>

          {/* Right — price + seller cards */}
          <div className="space-y-6">
            {/* Price card */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="space-y-2">
                <Skeleton className={`h-9 w-32 ${SK}`} />
                <Skeleton className={`h-5 w-40 ${SK}`} />
              </div>
              <Skeleton className={`h-12 w-full rounded-md ${SK}`} />
            </div>

            {/* Seller card */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className={`h-12 w-12 rounded-full ${SK}`} />
                  <div className="space-y-2">
                    <Skeleton className={`h-4 w-28 ${SK}`} />
                    <Skeleton className={`h-3 w-16 ${SK}`} />
                  </div>
                </div>
                <Skeleton className={`h-8 w-24 rounded-md ${SK}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Title + meta */}
        <div className="mt-12 space-y-6">
          <div className="space-y-3">
            <Skeleton className={`h-9 w-3/4 ${SK}`} />
            <Skeleton className={`h-4 w-48 ${SK}`} />
          </div>

          <div className="h-px bg-border" />

          {/* Description */}
          <div className="space-y-3">
            <Skeleton className={`h-6 w-32 ${SK}`} />
            <Skeleton className={`h-4 w-full ${SK}`} />
            <Skeleton className={`h-4 w-full ${SK}`} />
            <Skeleton className={`h-4 w-5/6 ${SK}`} />
            <Skeleton className={`h-4 w-2/3 ${SK}`} />
          </div>

          {/* Delivery info card */}
          <Skeleton className={`h-28 w-full rounded-xl ${SK}`} />
        </div>
      </div>
    </div>
  )
}
