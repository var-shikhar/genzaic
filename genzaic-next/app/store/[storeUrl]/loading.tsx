import { Skeleton } from "@/components/ui/skeleton"

export default function StorefrontLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Cover */}
      <div className="h-48 md:h-64 bg-muted animate-pulse" />

      {/* Profile row */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
          <div className="-mt-14">
            <Skeleton className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-background" />
          </div>
          <div className="flex-1 text-center sm:text-left pb-4 space-y-3">
            <Skeleton className="h-8 w-56 mx-auto sm:mx-0" />
            <Skeleton className="h-4 w-72 mx-auto sm:mx-0" />
            <div className="flex items-center justify-center sm:justify-start gap-6 mt-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter row */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-full sm:w-44" />
          <Skeleton className="h-10 w-full sm:w-40" />
          <Skeleton className="h-10 w-full sm:w-44" />
        </div>

        {/* Product grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border overflow-hidden">
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
