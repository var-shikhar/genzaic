import { Skeleton } from "@/components/ui/skeleton"

export default function BuyerLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-32 mt-2" />
      </div>

      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
