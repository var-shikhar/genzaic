import { HydrationBoundary, dehydrate, QueryClient } from "@tanstack/react-query"
import { auth } from "@/lib/auth"
import { getProductsListForUser } from "@/lib/data/dashboard"
import { productKeys } from "@/lib/queries/products"
import { CatalogClient } from "./CatalogClient"

// Server Component: prefetches the initial unfiltered products list (the
// default state when the page first loads). Debounced search is user-driven
// and refetches client-side — intentionally not prefetched.
export default async function ProductsPage() {
  const session = await auth()
  const userId = session?.user?.id as string | undefined

  const qc = new QueryClient()

  if (userId) {
    await qc
      .prefetchQuery({
        queryKey: productKeys.list({ page: 1, limit: 50 }),
        queryFn: () => getProductsListForUser(userId, { page: 1, limit: 50 }),
      })
      .catch(() => {})
  }

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <CatalogClient />
    </HydrationBoundary>
  )
}
