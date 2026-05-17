import { Skeleton } from "@/components/ui/skeleton"

// Per-route skeleton for the catalog page: editorial header + filter pills +
// list rows. Covers both list and grid view shapes well enough that switching
// view doesn't make the skeleton feel wrong.
export default function ProductsLoading() {
  return (
    <div className="space-y-6">
      <header className="pb-6 border-b border-primary/30 space-y-3">
        <Skeleton className="h-3 w-32" />
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-9 w-28" />
        </div>
      </header>

      <div className="flex items-center gap-3 flex-wrap">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-20 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-16 ml-auto" />
      </div>

      <div className="border rounded-md divide-y">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="p-4 grid grid-cols-[64px_1fr_120px_100px_40px] gap-4 items-center"
          >
            <Skeleton className="h-14 w-14 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
