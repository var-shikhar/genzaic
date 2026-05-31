import { HydrationBoundary, dehydrate, QueryClient } from "@tanstack/react-query"
import { auth } from "@/lib/auth"
import {
  getProductStatsForUser,
  getSalesStatsForUser,
  getProductsListForUser,
} from "@/lib/data/dashboard"
import { productKeys } from "@/lib/queries/products-keys"
import { salesKeys } from "@/lib/queries/sales-keys"
import { DashboardClient } from "./DashboardClient"

// Server Component: prefetches the three dashboard queries in parallel and
// hands them to the client via HydrationBoundary. The client's `useQuery`
// hooks read from the seeded cache on first render — no waterfall, no blank
// stat cards while a TanStack Query fires from the browser.
export default async function DashboardPage() {
  const session = await auth()
  const userId = session?.user?.id as string | undefined
  const firstName = (session?.user?.name ?? "there").split(" ")[0]

  const qc = new QueryClient()

  if (userId) {
    // Three independent reads — run in parallel. Errors are non-fatal: if a
    // prefetch fails we fall back to client-side fetching, the dashboard just
    // briefly shows zeros instead of seeded values.
    await Promise.all([
      qc
        .prefetchQuery({
          queryKey: productKeys.stats(),
          queryFn: () => getProductStatsForUser(userId),
        })
        .catch(() => {}),
      qc
        .prefetchQuery({
          queryKey: salesKeys.stats(),
          queryFn: () => getSalesStatsForUser(userId),
        })
        .catch(() => {}),
      qc
        .prefetchQuery({
          queryKey: productKeys.list({ page: 1, limit: 50 }),
          queryFn: () => getProductsListForUser(userId, { page: 1, limit: 50 }),
        })
        .catch(() => {}),
    ])
  }

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <DashboardClient firstName={firstName} />
    </HydrationBoundary>
  )
}
