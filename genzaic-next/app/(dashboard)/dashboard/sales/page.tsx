import { HydrationBoundary, dehydrate, QueryClient } from "@tanstack/react-query"
import { auth } from "@/lib/auth"
import { getSalesStatsForUser } from "@/lib/data/dashboard"
import {
  getOrdersForUser,
  getRecentOrdersForUser,
  getDownloadLogsForUser,
} from "@/lib/data/sales"
import { salesKeys } from "@/lib/queries/sales"
import { SalesClient } from "./SalesClient"

// Server Component: prefetches the four sales-page queries in parallel and
// hands a seeded TanStack cache to the client. The client's useQuery hooks
// (useSalesStats / useOrders / useRecentOrders / useDownloadLogs) read from
// cache on first render — zero network round-trips before paint.
//
// Search / status filters are user-driven and intentionally not prefetched;
// the initial unfiltered page is what every visit lands on.
export default async function SalesPage() {
  const session = await auth()
  const userId = session?.user?.id as string | undefined

  const qc = new QueryClient()

  if (userId) {
    await Promise.all([
      qc
        .prefetchQuery({
          queryKey: salesKeys.stats(),
          queryFn: () => getSalesStatsForUser(userId),
        })
        .catch(() => {}),
      qc
        .prefetchQuery({
          queryKey: salesKeys.ordersList({}),
          queryFn: () => getOrdersForUser(userId, {}),
        })
        .catch(() => {}),
      qc
        .prefetchQuery({
          queryKey: salesKeys.recent(),
          queryFn: () => getRecentOrdersForUser(userId),
        })
        .catch(() => {}),
      qc
        .prefetchQuery({
          queryKey: salesKeys.downloadList({}),
          queryFn: () => getDownloadLogsForUser(userId, {}),
        })
        .catch(() => {}),
    ])
  }

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <SalesClient />
    </HydrationBoundary>
  )
}
