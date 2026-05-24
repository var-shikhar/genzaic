import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

// Per-route skeleton: matches the Sales page layout (editorial header + 4
// stat cards + tab bar + filter row + 8-row table). Overrides the generic
// (dashboard)/loading.tsx so the user sees a shape that matches what loads.
export default function SalesLoading() {
  return (
    <div className="space-y-6">
      <header className="pb-6 border-b border-primary/30 space-y-3">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-4 w-72" />
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-28 ml-auto" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="border-b p-4 grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-16" />
            ))}
          </div>
          {Array.from({ length: 8 }).map((_, row) => (
            <div
              key={row}
              className="border-b p-4 grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 items-center"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
