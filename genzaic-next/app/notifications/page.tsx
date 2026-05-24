import { HydrationBoundary, dehydrate, QueryClient } from "@tanstack/react-query"
import { auth } from "@/lib/auth"
import { getNotificationsForUser } from "@/lib/data/notifications"
import { notificationKeys } from "@/hooks/use-notifications"
import { NotificationsClient } from "./NotificationsClient"

// Server Component: prefetches the default ("All") page so the client's
// useInfiniteQuery hydrates from cache instead of firing a roundtrip on
// first render. The "Unread" tab still fetches client-side — switching tabs
// is rare enough that prefetching both wastes bytes.
export default async function NotificationsPage() {
  const session = await auth()
  const userId = session?.user?.id as string | undefined

  const qc = new QueryClient()

  if (userId) {
    await qc
      .prefetchInfiniteQuery({
        queryKey: notificationKeys.list({}),
        initialPageParam: null,
        queryFn: () => getNotificationsForUser(userId, {}),
      })
      .catch(() => {
        // Non-fatal: client falls back to its own fetch, just shows skeleton briefly.
      })
  }

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <NotificationsClient />
    </HydrationBoundary>
  )
}
