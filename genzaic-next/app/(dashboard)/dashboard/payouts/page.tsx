import { HydrationBoundary, dehydrate, QueryClient } from "@tanstack/react-query"
import { auth } from "@/lib/auth"
import { getPayoutStatsForUser, getPayoutsForUser } from "@/lib/data/payouts"
import { payoutKeys } from "@/lib/queries/payouts-keys"
import { PayoutsClient } from "./PayoutsClient"

// Server Component: prefetches payout stats + the initial unfiltered payouts
// list in parallel. Selected-payout detail is loaded on demand by the client
// when the user clicks a row.
export default async function PayoutsPage() {
  const session = await auth()
  const userId = session?.user?.id as string | undefined

  const qc = new QueryClient()

  if (userId) {
    await Promise.all([
      qc
        .prefetchQuery({
          queryKey: payoutKeys.stats(),
          queryFn: () => getPayoutStatsForUser(userId),
        })
        .catch(() => {}),
      qc
        .prefetchQuery({
          queryKey: payoutKeys.list({}),
          queryFn: async () => {
            const r = await getPayoutsForUser(userId, {})
            // Match the client's useQuery shape: it expects { payouts, total }
            // — same as the route handler — so cache hits line up.
            return { payouts: r.payouts, total: r.total }
          },
        })
        .catch(() => {}),
    ])
  }

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <PayoutsClient />
    </HydrationBoundary>
  )
}
