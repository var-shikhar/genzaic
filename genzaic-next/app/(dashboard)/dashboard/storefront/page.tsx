import { Suspense } from "react"
import { StorefrontEditor } from "@/components/dashboard/StorefrontEditor"
import { Skeleton } from "@/components/ui/skeleton"

export default function StorefrontPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-[600px] rounded-xl" />
        </div>
      }
    >
      <StorefrontEditor />
    </Suspense>
  )
}
