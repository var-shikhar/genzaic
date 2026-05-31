import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

// Per-route skeleton for The Ledger: header + 3 KPI cards + ledger table.
export default function PayoutsLoading() {
  return (
    <div className="space-y-6">
      <header className="pb-6 border-b border-primary/30 space-y-3">
        <Skeleton className="h-3 w-44" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-72" />
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="border-b p-4 grid grid-cols-[1fr_120px_120px_120px] gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-16" />
            ))}
          </div>
          {Array.from({ length: 6 }).map((_, row) => (
            <div
              key={row}
              className="border-b p-4 grid grid-cols-[1fr_120px_120px_120px] gap-4 items-center"
            >
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-8 w-20 rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
