# State Migration (Redux/RTK Query → TanStack Query + Zustand) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Redux Toolkit + RTK Query data layer with TanStack Query (server state) + Zustand (client state) so every existing screen behaves identically, then delete the `store/` directory.

**Architecture:** Add a new `lib/react-query/` foundation (QueryClient + provider + `useOptimisticMutation` + `runMutation`), one `lib/queries/<resource>.ts` per RTK Query slice with hierarchical key factories, a single `lib/stores/auth.ts` Zustand store (forward-looking: persisted, synced from `useSession()`), and rewrite `app/providers.tsx` to mount QueryClientProvider in place of the Redux Provider. Migration runs slice-by-slice; both old and new providers coexist only during the brief window each slice is being swapped. The `store/` directory is deleted at the end.

**Tech Stack:** Next.js 15 App Router · TanStack Query v5 · Zustand v5 · NextAuth v5 (already in place) · Sonner (already in place) · TypeScript strict.

**Important constraints (from spec):**
- No git commits in this plan — the user runs git manually.
- No tests — the project has no test suite; verification is `npm run build` + `npm run lint` + manual smoke.
- Server API routes are **not** modified.

**Important discoveries from codebase reading:**
- `authSlice`, `uiSlice`, `useAppSelector`, `useAppDispatch` have **zero consumers** outside `store/` itself. They are orphan abstractions. They will be deleted as part of removing `store/`, with no cascading consumer updates. The Zustand auth store and `useSyncAuthStore` are forward-looking infra for A2/A3/A4.
- All RTK Query consumers are listed below per task. There are no surprise importers.
- `lib/api-error.ts` reads `err.data.error` (RTK Query's error shape). After migration, errors thrown by our `fetch` wrappers are native `Error` objects (`err.message`). Task 0 includes a small refactor of `getApiErrorMessage` to handle both shapes so error toasts continue to surface backend-specific messages.

---

## File Structure

**New files (created during plan):**
- `lib/react-query/query-client.ts` — singleton QueryClient
- `lib/react-query/provider.tsx` — `<ReactQueryProvider>` with Devtools in dev
- `lib/react-query/use-optimistic-mutation.ts` — wrapper hook (snapshot/rollback/invalidate + optional toast)
- `lib/react-query/run-mutation.ts` — toast wrapper for non-optimistic mutations
- `lib/react-query/fetcher.ts` — shared `fetch` helpers (`getJSON`, `postJSON`, `putJSON`, `patchJSON`, `deleteJSON`, `postForm`, `putForm`) with consistent error parsing
- `lib/queries/keys.ts` — central re-export of all key factories
- `lib/queries/ai.ts` — `aiKeys` + `useParseProductText`
- `lib/queries/auth.ts` — `useSignup`, `useVerifyOTP`, `useResendOTP`, `useForgotPassword`, `useResetPassword`
- `lib/queries/buyer.ts` — `buyerKeys` + `useMyOrders`, `useMyOrder`, `useLinkOrders`
- `lib/queries/checkout.ts` — `checkoutKeys` + `useCheckoutProduct`, `useCreateOrder`, `useOrderForDownload`, `useRecordDownload`
- `lib/queries/kyc.ts` — `kycKeys` + `useKyc`, `useSubmitKyc`, `useDeleteKyc`
- `lib/queries/onboarding.ts` — `onboardingKeys` + `useOnboardingStatus`, `useSelectPlan`, `useCompleteOnboarding`, `useSkipOnboarding`
- `lib/queries/payouts.ts` — `payoutKeys` + `usePayoutStats`, `usePayouts`, `usePayout`
- `lib/queries/products.ts` — `productKeys` + `useProducts`, `useProduct`, `useProductStats`, `useCreateProduct`, `useUpdateProduct`, `useDeleteProduct`, `useToggleProductStatus`
- `lib/queries/sales.ts` — `salesKeys` + `useSalesStats`, `useOrders`, `useRecentOrders`, `useOrder`, `useDownloadLogs`
- `lib/queries/storefront.ts` — `storefrontKeys` + `useStorefront`, `usePublicStorefront`, `useUpdateStorefront`, `useTogglePublish`, `useCheckSlug`, `useStorefrontStats`
- `lib/queries/user.ts` — `userKeys` + `useProfile`, `useUpdateProfile`, `useChangePassword`, `useCheckStoreUrl`
- `lib/stores/auth.ts` — `useAuthStore` (Zustand, persisted)
- `hooks/use-sync-auth-store.ts` — bridges `useSession()` → `useAuthStore`
- `app/providers.tsx` — replacement for `store/providers.tsx`

**Deleted at end of plan:**
- `store/api/*.ts` (all 11 slice files)
- `store/slices/authSlice.ts`, `store/slices/uiSlice.ts`
- `store/hooks.ts`, `store/index.ts`, `store/providers.tsx`
- The empty `store/` directory itself
- `hooks/use-mutation-toast.ts`

**Modified files (consumers):**
- `app/layout.tsx` — switches from `@/store/providers` import to `@/app/providers`
- `lib/api-error.ts` — handle native `Error` objects in addition to RTK Query shape
- `package.json` — `+@tanstack/react-query`, `+@tanstack/react-query-devtools`, `+zustand`, `-@reduxjs/toolkit`, `-react-redux`, `-redux-persist`
- (Per-slice consumer files listed in each Task below.)

---

## Task 0: Foundation — install deps, query client, provider, helpers

**Goal:** Land the new infrastructure with **zero behavior change**. Both the Redux Provider and the new QueryClientProvider mount, but no consumer is using the new hooks yet.

**Files:**
- Modify: `package.json`
- Create: `lib/react-query/query-client.ts`
- Create: `lib/react-query/provider.tsx`
- Create: `lib/react-query/use-optimistic-mutation.ts`
- Create: `lib/react-query/run-mutation.ts`
- Create: `lib/queries/keys.ts` (empty re-export, populated as slices migrate)
- Create: `lib/stores/auth.ts`
- Create: `hooks/use-sync-auth-store.ts`
- Create: `app/providers.tsx`
- Modify: `app/layout.tsx` (one import path)

- [ ] **Step 0.1: Install dependencies**

Run: `npm install @tanstack/react-query @tanstack/react-query-devtools zustand`

Expected: deps installed, `package.json` updated.

- [ ] **Step 0.2: Create the QueryClient singleton**

Create `lib/react-query/query-client.ts`:

```ts
import { QueryClient } from "@tanstack/react-query"

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Library defaults: staleTime 0, refetch on focus/reconnect/mount.
        // Mutations and queries log errors via TanStack Query devtools.
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

export function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient()
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}
```

- [ ] **Step 0.3: Create the React Query provider**

Create `lib/react-query/provider.tsx`:

```tsx
"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { getQueryClient } from "./query-client"

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
```

- [ ] **Step 0.4: Create `useOptimisticMutation`**

Create `lib/react-query/use-optimistic-mutation.ts`:

```ts
"use client"

import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
} from "@tanstack/react-query"
import { toast } from "sonner"

interface ToastOpts {
  loading?: string
  success?: string
  error?: string
}

interface OptimisticOpts<TInput, TQueryData> {
  queryKey: QueryKey
  updater: (old: TQueryData | undefined, input: TInput) => TQueryData | undefined
}

interface Options<TInput, TData, TQueryData> {
  mutationFn: (input: TInput) => Promise<TData>
  optimistic?: OptimisticOpts<TInput, TQueryData>
  invalidateKeys?: QueryKey[]
  toast?: ToastOpts
  onSuccess?: (data: TData, input: TInput) => void
  onError?: (err: unknown, input: TInput) => void
}

export function useOptimisticMutation<TInput, TData, TQueryData = unknown>(
  opts: Options<TInput, TData, TQueryData>,
) {
  const qc = useQueryClient()

  const mutationOptions: UseMutationOptions<TData, unknown, TInput, { snapshot?: TQueryData }> = {
    mutationFn: opts.mutationFn,
    onMutate: async (input) => {
      if (!opts.optimistic) return {}
      const { queryKey, updater } = opts.optimistic
      await qc.cancelQueries({ queryKey })
      const snapshot = qc.getQueryData<TQueryData>(queryKey)
      qc.setQueryData<TQueryData>(queryKey, (old) => updater(old, input) as TQueryData)
      return { snapshot }
    },
    onError: (err, input, ctx) => {
      if (opts.optimistic && ctx?.snapshot !== undefined) {
        qc.setQueryData(opts.optimistic.queryKey, ctx.snapshot)
      }
      if (opts.toast?.error) toast.error(opts.toast.error)
      opts.onError?.(err, input)
    },
    onSuccess: (data, input) => {
      if (opts.toast?.success) toast.success(opts.toast.success)
      opts.onSuccess?.(data, input)
    },
    onSettled: () => {
      const keys = opts.invalidateKeys ?? (opts.optimistic ? [opts.optimistic.queryKey] : [])
      keys.forEach((key) => qc.invalidateQueries({ queryKey: key }))
    },
  }

  return useMutation(mutationOptions)
}
```

- [ ] **Step 0.5: Create `runMutation`**

Create `lib/react-query/run-mutation.ts`:

```ts
import { toast } from "sonner"

interface ToastOptions {
  loading?: string
  success: string
  error?: string
}

/**
 * Wraps a TanStack Query `mutateAsync(...)` call so success / error toasts
 * fire automatically. Returns the resolved value on success or `undefined`
 * on failure (the toast is the error UI).
 *
 * Usage:
 *   const m = useDeleteProduct()
 *   await runMutation(m.mutateAsync(id), { success: "Deleted" })
 */
export async function runMutation<T>(
  promise: Promise<T>,
  { loading, success, error = "Something went wrong" }: ToastOptions,
): Promise<T | undefined> {
  if (loading) {
    return toast.promise(promise, { loading, success, error }) as unknown as Promise<T | undefined>
  }
  try {
    const result = await promise
    toast.success(success)
    return result
  } catch {
    toast.error(error)
    return undefined
  }
}
```

- [ ] **Step 0.5b: Update `lib/api-error.ts` to handle native `Error` objects**

Replace the contents of `lib/api-error.ts` with:

```ts
// API routes return `{ error: string }` on failure. RTK Query wrapped this as
// `err.data.error`; the new TanStack Query layer throws native `Error` objects
// where the backend message is the `Error.message`. This helper handles both
// shapes plus a plain `{ error }` body, so error toasts surface backend-
// specific messages regardless of which call path produced the failure.
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (!err) return fallback

  // Native Error (TanStack Query path): the fetch wrappers throw
  // `new Error(body.error ?? "Request failed: <status>")`, so `message` is
  // the backend's error string when one was returned.
  if (err instanceof Error && err.message) return err.message

  // RTK Query shape (still around during the coexistence period).
  const rtk = err as { data?: { error?: string; message?: string } }
  if (rtk?.data?.error) return rtk.data.error
  if (rtk?.data?.message) return rtk.data.message

  // Plain `{ error }` shape (e.g. body parsed manually).
  const plain = err as { error?: string; message?: string }
  if (plain?.error) return plain.error
  if (plain?.message) return plain.message

  return fallback
}
```

(The fetch wrappers in subsequent tasks all throw `new Error(body.error ?? "Request failed: <status>")` after parsing the JSON body — this matches what `getApiErrorMessage` now expects on the `Error` branch.)

- [ ] **Step 0.5c: Standardize the fetch error wrapper**

Create `lib/react-query/fetcher.ts` for use by all `lib/queries/*.ts` files. This factors out the consistent error-extraction behavior so each query file does not have to repeat the parsing logic:

```ts
async function readErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string; message?: string }
    return body?.error ?? body?.message ?? `Request failed: ${res.status}`
  } catch {
    return `Request failed: ${res.status}`
  }
}

export async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(await readErrorMessage(res))
  return (await res.json()) as T
}

export async function postJSON<TIn, TOut>(url: string, body?: TIn): Promise<TOut> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(await readErrorMessage(res))
  return (await res.json()) as TOut
}

export async function putJSON<TIn, TOut>(url: string, body: TIn): Promise<TOut> {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await readErrorMessage(res))
  return (await res.json()) as TOut
}

export async function patchJSON<TOut>(url: string): Promise<TOut> {
  const res = await fetch(url, { method: "PATCH" })
  if (!res.ok) throw new Error(await readErrorMessage(res))
  return (await res.json()) as TOut
}

export async function deleteJSON(url: string): Promise<void> {
  const res = await fetch(url, { method: "DELETE" })
  if (!res.ok) throw new Error(await readErrorMessage(res))
}

export async function postForm<TOut>(url: string, form: FormData): Promise<TOut> {
  const res = await fetch(url, { method: "POST", body: form })
  if (!res.ok) throw new Error(await readErrorMessage(res))
  return (await res.json()) as TOut
}

export async function putForm<TOut>(url: string, form: FormData): Promise<TOut> {
  const res = await fetch(url, { method: "PUT", body: form })
  if (!res.ok) throw new Error(await readErrorMessage(res))
  return (await res.json()) as TOut
}
```

In subsequent tasks, replace each file's local `getJSON` / `postJSON` definition with `import { getJSON, postJSON, putJSON, patchJSON, deleteJSON, postForm, putForm } from "@/lib/react-query/fetcher"`. The query-file code samples below show local helpers for clarity, but the executing agent should use the central `fetcher.ts` imports instead. (If the executing agent prefers, the local helpers can stay — both work, but the central version yields consistent error parsing.)

- [ ] **Step 0.6: Create the empty central key factory file**

Create `lib/queries/keys.ts`:

```ts
// Re-exports of every per-resource query key factory.
// Populated as each slice migrates in subsequent tasks.

export {}
```

- [ ] **Step 0.7: Create the Zustand auth store**

Create `lib/stores/auth.ts`:

```ts
"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface AuthUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  storeUrl?: string | null
  isSeller?: boolean
  role?: "buyer" | "seller" | "admin"
}

interface AuthState {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clear: () => set({ user: null }),
    }),
    {
      name: "genzaic-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    },
  ),
)
```

- [ ] **Step 0.8: Create `useSyncAuthStore`**

Create `hooks/use-sync-auth-store.ts`:

```ts
"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useAuthStore, type AuthUser } from "@/lib/stores/auth"

/**
 * Watches the NextAuth session and mirrors user fields into the Zustand
 * `useAuthStore` so consumers can read them synchronously after first paint
 * (the persisted snapshot warms the store before hydration). On sign-out
 * the store is cleared.
 */
export function useSyncAuthStore() {
  const { data: session, status } = useSession()
  const setUser = useAuthStore((s) => s.setUser)
  const clear = useAuthStore((s) => s.clear)

  useEffect(() => {
    if (status === "loading") return
    if (!session?.user) {
      clear()
      return
    }
    const u = session.user as AuthUser & { id?: string }
    setUser({
      id: u.id ?? "",
      name: u.name ?? null,
      email: u.email ?? null,
      image: u.image ?? null,
      storeUrl: u.storeUrl ?? null,
      isSeller: u.isSeller ?? undefined,
      role: u.role ?? undefined,
    })
  }, [session, status, setUser, clear])
}
```

- [ ] **Step 0.9: Create the new `app/providers.tsx` (mounts BOTH old Redux Provider AND new QueryClientProvider)**

Create `app/providers.tsx`:

```tsx
"use client"

import { Provider as ReduxProvider } from "react-redux"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import type { Session } from "next-auth"
import { store } from "@/store/index"
import { ReactQueryProvider } from "@/lib/react-query/provider"
import { AuthSync } from "./auth-sync"

interface ProvidersProps {
  children: React.ReactNode
  session?: Session | null
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <ReactQueryProvider>
        <ReduxProvider store={store}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthSync />
            {children}
          </ThemeProvider>
        </ReduxProvider>
      </ReactQueryProvider>
    </SessionProvider>
  )
}
```

Create `app/auth-sync.tsx` (separate client component so the sync hook runs inside `SessionProvider` without forcing the whole tree to be a client component):

```tsx
"use client"

import { useSyncAuthStore } from "@/hooks/use-sync-auth-store"

export function AuthSync() {
  useSyncAuthStore()
  return null
}
```

- [ ] **Step 0.10: Switch `app/layout.tsx` to import from the new providers location**

Modify `app/layout.tsx`:

Old:
```tsx
import { Providers } from "@/store/providers"
```
New:
```tsx
import { Providers } from "./providers"
```

(Everything else in `app/layout.tsx` is unchanged.)

- [ ] **Step 0.11: Verify build**

Run: `npm run lint && npm run build`
Expected: both pass. App still works because every consumer is still on RTK Query; the new infrastructure is mounted but unused.

---

## Task 1: Migrate `aiApi` (least coupled — single mutation, one consumer)

**Files:**
- Create: `lib/queries/ai.ts`
- Modify: `components/dashboard/AIExtractionModal.tsx`
- Modify: `lib/queries/keys.ts`
- Modify: `store/index.ts`
- Delete: `store/api/aiApi.ts`

- [ ] **Step 1.1: Create `lib/queries/ai.ts`**

```ts
"use client"

import { useMutation } from "@tanstack/react-query"

export interface ExtractedProduct {
  title: string
  description: string
  price?: number
  originalPrice?: number
  subscriptionDuration?: string
}

export const aiKeys = {
  all: ["ai"] as const,
} as const

export function useParseProductText() {
  return useMutation({
    mutationFn: async (input: { text: string }) => {
      const res = await fetch("/api/ai/parse-product-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error("AI extraction failed")
      return (await res.json()) as { products: ExtractedProduct[]; count: number }
    },
  })
}
```

- [ ] **Step 1.2: Re-export `aiKeys` from `lib/queries/keys.ts`**

Modify `lib/queries/keys.ts`:

```ts
export { aiKeys } from "./ai"
```

- [ ] **Step 1.3: Update `AIExtractionModal.tsx` consumer**

In `components/dashboard/AIExtractionModal.tsx`:

- Replace `import { useParseProductTextMutation } from "@/store/api/aiApi"` with `import { useParseProductText } from "@/lib/queries/ai"`.
- Replace `const [parseProductText, { isLoading }] = useParseProductTextMutation()` with `const { mutateAsync: parseProductText, isPending: isLoading } = useParseProductText()`.
- Replace any `.unwrap()` on the result with the plain awaited value (TanStack mutations resolve the value directly).

- [ ] **Step 1.4: Remove `aiApi` from `store/index.ts`**

In `store/index.ts`:
- Remove `import { aiApi } from "./api/aiApi"`
- Remove `[aiApi.reducerPath]: aiApi.reducer,` from the `reducer` block
- Remove `aiApi.middleware` from the `.concat(...)` argument list

- [ ] **Step 1.5: Delete `store/api/aiApi.ts`**

Run: `rm d:/Shikhar/genzaic-creator-hub/genzaic-next/store/api/aiApi.ts`

- [ ] **Step 1.6: Verify build + smoke**

Run: `npm run lint && npm run build`
Expected: both pass. Smoke: open the AI extraction modal in the product form, paste sample text, confirm extraction populates the form.

---

## Task 2: Migrate `payoutsApi` (read-only queries, three consumers)

**Files:**
- Create: `lib/queries/payouts.ts`
- Modify: `app/(dashboard)/dashboard/payouts/page.tsx`
- Modify: `lib/queries/keys.ts`
- Modify: `store/index.ts`
- Delete: `store/api/payoutsApi.ts`

- [ ] **Step 2.1: Create `lib/queries/payouts.ts`**

```ts
"use client"

import { useQuery } from "@tanstack/react-query"

export interface Payout {
  id: string
  amount: string
  status: "pending" | "processing" | "completed" | "failed"
  transactionId?: string | null
  utrNumber?: string | null
  failureReason?: string | null
  processedAt?: string | null
  createdAt: string
}

export interface PayoutStats {
  totalEarnings: number
  completedPayouts: number
  pendingPayouts: number
  kycStatus: string
  kycVerified: boolean
  bankAccount?: {
    accountHolderName: string
    accountNumber: string
    ifscCode: string
    bankName: string
  } | null
}

export const payoutKeys = {
  all: ["payouts"] as const,
  stats: () => [...payoutKeys.all, "stats"] as const,
  lists: () => [...payoutKeys.all, "list"] as const,
  list: (filters: { page?: number; limit?: number; status?: string }) =>
    [...payoutKeys.lists(), filters] as const,
  details: () => [...payoutKeys.all, "detail"] as const,
  detail: (id: string) => [...payoutKeys.details(), id] as const,
} as const

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return (await res.json()) as T
}

export function usePayoutStats() {
  return useQuery({
    queryKey: payoutKeys.stats(),
    queryFn: () => getJSON<PayoutStats>("/api/payouts/stats"),
  })
}

export function usePayouts(filters: { page?: number; limit?: number; status?: string } = {}) {
  return useQuery({
    queryKey: payoutKeys.list(filters),
    queryFn: () => {
      const { page = 1, limit = 10, status } = filters
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (status) params.set("status", status)
      return getJSON<{ payouts: Payout[]; total: number }>(`/api/payouts/?${params}`)
    },
  })
}

export function usePayout(id: string) {
  return useQuery({
    queryKey: payoutKeys.detail(id),
    queryFn: () => getJSON<Payout>(`/api/payouts/${id}`),
    enabled: Boolean(id),
  })
}
```

- [ ] **Step 2.2: Re-export `payoutKeys` from `lib/queries/keys.ts`**

Append to `lib/queries/keys.ts`:
```ts
export { payoutKeys } from "./payouts"
```

- [ ] **Step 2.3: Update `app/(dashboard)/dashboard/payouts/page.tsx`**

- Replace `import { useGetPayoutStatsQuery, useGetPayoutsQuery } from "@/store/api/payoutsApi"` with `import { usePayoutStats, usePayouts } from "@/lib/queries/payouts"`.
- Replace `useGetPayoutStatsQuery()` with `usePayoutStats()`.
- Replace `useGetPayoutsQuery({ ... })` with `usePayouts({ ... })`.
- Field names match — the returned object exposes `data`, `isLoading` (TanStack uses `isPending` for mutations, `isLoading` for queries).

- [ ] **Step 2.4: Remove `payoutsApi` from `store/index.ts`** (same pattern as Task 1.4)

- [ ] **Step 2.5: Delete `store/api/payoutsApi.ts`**

- [ ] **Step 2.6: Verify build + smoke**

Run: `npm run lint && npm run build`
Smoke: open `/dashboard/payouts`, confirm stats card and payouts list render.

---

## Task 3: Migrate `buyerApi`

**Files:**
- Create: `lib/queries/buyer.ts`
- Modify: `app/(buyer)/my-purchases/page.tsx`
- Modify: `app/(buyer)/my-purchases/[orderId]/page.tsx`
- Modify: `lib/queries/keys.ts`
- Modify: `store/index.ts`
- Delete: `store/api/buyerApi.ts`

- [ ] **Step 3.1: Create `lib/queries/buyer.ts`**

```ts
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export interface BuyerOrder {
  id: string
  productId: string
  productTitle: string
  productThumbnail?: string | null
  productDescription?: string | null
  sellerName: string
  sellerStoreUrl?: string | null
  sellerEmail?: string | null
  sellerPhone?: string | null
  sellerWhatsapp?: string | null
  totalAmount: string
  purchasedAt: string
  downloadCount: number
  maxDownloads: number
  downloadLink?: string | null
  deliveryType: "download" | "external_link" | "manual"
  externalUrl?: string | null
  deliveryStatus?: "pending" | "delivered" | null
}

export const buyerKeys = {
  all: ["buyer"] as const,
  orders: () => [...buyerKeys.all, "orders"] as const,
  order: (id: string) => [...buyerKeys.orders(), id] as const,
} as const

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return (await res.json()) as T
}

export function useMyOrders() {
  return useQuery({
    queryKey: buyerKeys.orders(),
    queryFn: () => getJSON<BuyerOrder[]>("/api/buyer/orders"),
  })
}

export function useMyOrder(orderId: string) {
  return useQuery({
    queryKey: buyerKeys.order(orderId),
    queryFn: () => getJSON<BuyerOrder>(`/api/buyer/orders/${orderId}`),
    enabled: Boolean(orderId),
  })
}

export function useLinkOrders() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { email: string }) => {
      const res = await fetch("/api/buyer/link-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error("Failed to link orders")
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: buyerKeys.orders() }),
  })
}
```

- [ ] **Step 3.2: Re-export from keys.ts**

Append: `export { buyerKeys } from "./buyer"`

- [ ] **Step 3.3: Update `app/(buyer)/my-purchases/page.tsx`**

- Replace `import { useGetMyOrdersQuery } from "@/store/api/buyerApi"` with `import { useMyOrders } from "@/lib/queries/buyer"`.
- Replace `useGetMyOrdersQuery()` with `useMyOrders()`.

- [ ] **Step 3.4: Update `app/(buyer)/my-purchases/[orderId]/page.tsx`**

- Replace `import { useGetMyOrderQuery } from "@/store/api/buyerApi"` with `import { useMyOrder } from "@/lib/queries/buyer"`.
- Replace `useGetMyOrderQuery(orderId)` with `useMyOrder(orderId)`.

- [ ] **Step 3.5: Remove `buyerApi` from `store/index.ts`**

- [ ] **Step 3.6: Delete `store/api/buyerApi.ts`**

- [ ] **Step 3.7: Verify build + smoke**

Run: `npm run lint && npm run build`
Smoke: `/my-purchases` and an individual order detail render correctly for a logged-in buyer.

---

## Task 4: Migrate `salesApi`

**Files:**
- Create: `lib/queries/sales.ts`
- Modify: `app/(dashboard)/dashboard/sales/page.tsx`
- Modify: `app/(dashboard)/dashboard/page.tsx`
- Modify: `lib/queries/keys.ts`
- Modify: `store/index.ts`
- Delete: `store/api/salesApi.ts`

- [ ] **Step 4.1: Create `lib/queries/sales.ts`**

```ts
"use client"

import { useQuery } from "@tanstack/react-query"

export interface SalesOrder {
  id: string
  orderNumber: string
  productTitle: string
  productThumbnail?: string | null
  buyerName: string
  buyerEmail: string
  buyerPhone?: string | null
  subtotal: string
  gstAmount: string
  totalAmount: string
  status: "pending" | "completed"
  deliveryType: "download" | "external_link" | "manual"
  deliveryStatus?: "pending" | "delivered" | null
  downloadCount: number
  createdAt: string
}

export interface SalesStats {
  totalRevenue: number
  totalOrders: number
  completedOrders: number
  pendingAmount: number
  monthlyRevenue: number
  salesChange?: string
  ordersChange?: string
}

export const salesKeys = {
  all: ["sales"] as const,
  stats: () => [...salesKeys.all, "stats"] as const,
  orders: () => [...salesKeys.all, "orders"] as const,
  ordersList: (filters: { page?: number; limit?: number; status?: string; search?: string }) =>
    [...salesKeys.orders(), filters] as const,
  recent: () => [...salesKeys.orders(), "recent"] as const,
  detail: (id: string) => [...salesKeys.orders(), "detail", id] as const,
  downloads: () => [...salesKeys.all, "downloads"] as const,
  downloadList: (filters: { page?: number; limit?: number }) =>
    [...salesKeys.downloads(), filters] as const,
} as const

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return (await res.json()) as T
}

export function useSalesStats() {
  return useQuery({
    queryKey: salesKeys.stats(),
    queryFn: () => getJSON<SalesStats>("/api/sales/stats"),
  })
}

export function useOrders(filters: { page?: number; limit?: number; status?: string; search?: string } = {}) {
  return useQuery({
    queryKey: salesKeys.ordersList(filters),
    queryFn: () => {
      const { page = 1, limit = 10, status, search } = filters
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (status) params.set("status", status)
      if (search) params.set("search", search)
      return getJSON<{ orders: SalesOrder[]; total: number }>(`/api/sales/orders?${params}`)
    },
  })
}

export function useRecentOrders() {
  return useQuery({
    queryKey: salesKeys.recent(),
    queryFn: () => getJSON<SalesOrder[]>("/api/sales/orders/recent"),
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: salesKeys.detail(id),
    queryFn: () => getJSON<SalesOrder>(`/api/sales/orders/${id}`),
    enabled: Boolean(id),
  })
}

export function useDownloadLogs(filters: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: salesKeys.downloadList(filters),
    queryFn: () => {
      const { page = 1, limit = 10 } = filters
      return getJSON<unknown[]>(`/api/sales/downloads?page=${page}&limit=${limit}`)
    },
  })
}
```

- [ ] **Step 4.2: Re-export from keys.ts**

Append: `export { salesKeys } from "./sales"`

- [ ] **Step 4.3: Update `app/(dashboard)/dashboard/sales/page.tsx`**

Replace the `import { ... } from "@/store/api/salesApi"` with the appropriate `import { useSalesStats, useOrders, useRecentOrders, useOrder, useDownloadLogs } from "@/lib/queries/sales"` (only the hooks actually used). Replace each hook call:

- `useGetSalesStatsQuery()` → `useSalesStats()`
- `useGetOrdersQuery(args)` → `useOrders(args)`
- `useGetRecentOrdersQuery()` → `useRecentOrders()`
- `useGetOrderQuery(id)` → `useOrder(id)`
- `useGetDownloadLogsQuery(args)` → `useDownloadLogs(args)`

- [ ] **Step 4.4: Update `app/(dashboard)/dashboard/page.tsx`**

- Replace `import { useGetSalesStatsQuery, useGetRecentOrdersQuery } from "@/store/api/salesApi"` with `import { useSalesStats, useRecentOrders } from "@/lib/queries/sales"`.
- Replace the hook calls (`useGetSalesStatsQuery()` → `useSalesStats()`, `useGetRecentOrdersQuery()` → `useRecentOrders()`).

- [ ] **Step 4.5: Remove `salesApi` from `store/index.ts`**

- [ ] **Step 4.6: Delete `store/api/salesApi.ts`**

- [ ] **Step 4.7: Verify build + smoke**

Run: `npm run lint && npm run build`
Smoke: dashboard overview page loads stats + recent orders; `/dashboard/sales` lists orders.

---

## Task 5: Migrate `kycApi` (includes optimistic update on submit)

**Files:**
- Create: `lib/queries/kyc.ts`
- Modify: `app/(dashboard)/dashboard/kyc/page.tsx`
- Modify: `lib/queries/keys.ts`
- Modify: `store/index.ts`
- Delete: `store/api/kycApi.ts`

- [ ] **Step 5.1: Create `lib/queries/kyc.ts`**

```ts
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useOptimisticMutation } from "@/lib/react-query/use-optimistic-mutation"

export interface KycData {
  id: string
  documentType: "pan" | "aadhaar"
  panNumber?: string | null
  aadhaarNumber?: string | null
  documentFileUrl?: string | null
  accountHolderName: string
  accountNumber: string
  ifscCode: string
  bankName: string
  verificationStatus: "not_submitted" | "pending" | "verified" | "rejected"
  pennyDropStatus: "pending" | "success" | "failed"
  rejectionReason?: string | null
  verifiedAt?: string | null
  createdAt: string
  updatedAt: string
}

export const kycKeys = {
  all: ["kyc"] as const,
  current: () => [...kycKeys.all, "current"] as const,
} as const

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return (await res.json()) as T
}

export function useKyc() {
  return useQuery({
    queryKey: kycKeys.current(),
    queryFn: () => getJSON<KycData | null>("/api/kyc/"),
  })
}

export function useSubmitKyc() {
  return useOptimisticMutation<FormData, KycData, KycData | null>({
    mutationFn: async (form) => {
      const res = await fetch("/api/kyc/", { method: "POST", body: form })
      if (!res.ok) throw new Error("Failed to submit KYC")
      return (await res.json()) as KycData
    },
    optimistic: {
      queryKey: kycKeys.current(),
      updater: (old) => {
        if (!old) return old
        return { ...old, verificationStatus: "pending", rejectionReason: null }
      },
    },
    invalidateKeys: [kycKeys.current()],
  })
}

export function useDeleteKyc() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/kyc/", { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete KYC")
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: kycKeys.current() }),
  })
}
```

- [ ] **Step 5.2: Re-export from keys.ts**

Append: `export { kycKeys } from "./kyc"`

- [ ] **Step 5.3: Update `app/(dashboard)/dashboard/kyc/page.tsx`**

- Replace `import { useGetKycQuery, useSubmitKycMutation } from "@/store/api/kycApi"` with `import { useKyc, useSubmitKyc } from "@/lib/queries/kyc"`.
- Replace `useGetKycQuery()` with `useKyc()`.
- Replace `const [submitKyc, { isLoading }] = useSubmitKycMutation()` with `const { mutateAsync: submitKyc, isPending: isLoading } = useSubmitKyc()`.
- Any `submitKyc(formData).unwrap()` becomes `submitKyc(formData)` (TanStack mutateAsync returns the value directly).

- [ ] **Step 5.4: Remove `kycApi` from `store/index.ts`**

- [ ] **Step 5.5: Delete `store/api/kycApi.ts`**

- [ ] **Step 5.6: Verify build + smoke**

Run: `npm run lint && npm run build`
Smoke: `/dashboard/kyc` loads existing KYC; submitting (or re-submitting) immediately shows "pending" status before server confirms.

---

## Task 6: Migrate `onboardingApi`

**Files:**
- Create: `lib/queries/onboarding.ts`
- Modify: `app/onboarding/page.tsx`
- Modify: `app/plan-selection/page.tsx`
- Modify: `lib/queries/keys.ts`
- Modify: `store/index.ts`
- Delete: `store/api/onboardingApi.ts`

- [ ] **Step 6.1: Create `lib/queries/onboarding.ts`**

```ts
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const onboardingKeys = {
  all: ["onboarding"] as const,
  status: () => [...onboardingKeys.all, "status"] as const,
} as const

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return (await res.json()) as T
}

async function postJSON<TIn, TOut>(url: string, body?: TIn): Promise<TOut> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return (await res.json()) as TOut
}

export function useOnboardingStatus() {
  return useQuery({
    queryKey: onboardingKeys.status(),
    queryFn: () => getJSON<{ complete: boolean; step: number }>("/api/onboarding/status"),
  })
}

export function useSelectPlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { plan: string }) => postJSON<typeof input, unknown>("/api/onboarding/plan", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: onboardingKeys.status() }),
  })
}

export function useCompleteOnboarding() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => postJSON<undefined, unknown>("/api/onboarding/complete"),
    onSuccess: () => qc.invalidateQueries({ queryKey: onboardingKeys.status() }),
  })
}

export function useSkipOnboarding() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => postJSON<undefined, unknown>("/api/onboarding/skip"),
    onSuccess: () => qc.invalidateQueries({ queryKey: onboardingKeys.status() }),
  })
}
```

- [ ] **Step 6.2: Re-export from keys.ts**

Append: `export { onboardingKeys } from "./onboarding"`

- [ ] **Step 6.3: Update `app/onboarding/page.tsx`**

- Replace `import { useCompleteOnboardingMutation, useSkipOnboardingMutation, useSelectPlanMutation } from "@/store/api/onboardingApi"` with `import { useCompleteOnboarding, useSkipOnboarding, useSelectPlan } from "@/lib/queries/onboarding"`.
- Replace `const [completeOnboarding] = useCompleteOnboardingMutation()` with `const { mutateAsync: completeOnboarding } = useCompleteOnboarding()` (and the same for skip + select).
- Any `.unwrap()` calls become plain awaits.

- [ ] **Step 6.4: Update `app/plan-selection/page.tsx`** (same pattern as 6.3 for `useSelectPlan` and `useCompleteOnboarding`)

- [ ] **Step 6.5: Remove `onboardingApi` from `store/index.ts`**

- [ ] **Step 6.6: Delete `store/api/onboardingApi.ts`**

- [ ] **Step 6.7: Verify build + smoke**

Run: `npm run lint && npm run build`
Smoke: onboarding flow and plan selection complete normally.

---

## Task 7: Migrate `checkoutApi`

**Files:**
- Create: `lib/queries/checkout.ts`
- Modify: `app/checkout/[productId]/page.tsx`
- Modify: `app/download/[orderId]/page.tsx`
- Modify: `lib/queries/keys.ts`
- Modify: `store/index.ts`
- Delete: `store/api/checkoutApi.ts`

- [ ] **Step 7.1: Create `lib/queries/checkout.ts`**

```ts
"use client"

import { useMutation, useQuery } from "@tanstack/react-query"

export interface CheckoutProduct {
  id: string
  title: string
  description?: string | null
  price: string
  originalPrice?: string | null
  thumbnailUrl?: string | null
  deliveryType: "download" | "external_link" | "manual"
  seller: {
    id: string
    name: string
    avatarUrl?: string | null
    storeUrl?: string | null
    storeName?: string | null
  }
  platformFeeMode: "seller" | "buyer"
}

export interface Order {
  id: string
  productTitle: string
  productThumbnail?: string | null
  buyerName: string
  buyerEmail: string
  totalAmount: string
  status: string
  deliveryType: string
  downloadLink?: string | null
  externalUrl?: string | null
  downloadCount: number
  maxDownloads: number
  createdAt: string
}

export const checkoutKeys = {
  all: ["checkout"] as const,
  product: (id: string) => [...checkoutKeys.all, "product", id] as const,
  order: (id: string) => [...checkoutKeys.all, "order", id] as const,
} as const

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return (await res.json()) as T
}

async function postJSON<TIn, TOut>(url: string, body: TIn): Promise<TOut> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return (await res.json()) as TOut
}

export function useCheckoutProduct(productId: string) {
  return useQuery({
    queryKey: checkoutKeys.product(productId),
    queryFn: () => getJSON<CheckoutProduct>(`/api/checkout/product/${productId}`),
    enabled: Boolean(productId),
  })
}

export interface CreateOrderInput {
  productId: string
  buyerName: string
  buyerEmail: string
  buyerPhone?: string
  buyerGstin?: string
  paymentMethod?: string
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: (input: CreateOrderInput) => postJSON<CreateOrderInput, Order>("/api/checkout/create-order", input),
  })
}

export function useOrderForDownload(orderId: string) {
  return useQuery({
    queryKey: checkoutKeys.order(orderId),
    queryFn: () => getJSON<Order>(`/api/checkout/order/${orderId}`),
    enabled: Boolean(orderId),
  })
}

export function useRecordDownload() {
  return useMutation({
    mutationFn: async (orderId: string) => {
      const res = await fetch("/api/checkout/record-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })
      if (!res.ok) throw new Error("Failed to record download")
    },
  })
}
```

- [ ] **Step 7.2: Re-export from keys.ts**

Append: `export { checkoutKeys } from "./checkout"`

- [ ] **Step 7.3: Update `app/checkout/[productId]/page.tsx`**

- Replace `import { useGetCheckoutProductQuery, useCreateOrderMutation } from "@/store/api/checkoutApi"` with `import { useCheckoutProduct, useCreateOrder } from "@/lib/queries/checkout"`.
- Replace `useGetCheckoutProductQuery(productId)` with `useCheckoutProduct(productId)`.
- Replace `const [createOrder, { isLoading }] = useCreateOrderMutation()` with `const { mutateAsync: createOrder, isPending: isLoading } = useCreateOrder()`.
- Replace `.unwrap()` with plain awaits.

- [ ] **Step 7.4: Update `app/download/[orderId]/page.tsx`**

- Replace `import { useGetOrderForDownloadQuery, useRecordDownloadMutation } from "@/store/api/checkoutApi"` with `import { useOrderForDownload, useRecordDownload } from "@/lib/queries/checkout"`.
- Hook signatures match the originals (`useOrderForDownload(orderId)`, `useRecordDownload()`).

- [ ] **Step 7.5: Remove `checkoutApi` from `store/index.ts`**

- [ ] **Step 7.6: Delete `store/api/checkoutApi.ts`**

- [ ] **Step 7.7: Verify build + smoke**

Run: `npm run lint && npm run build`
Smoke: full checkout flow on an active product → order created → download page loads.

---

## Task 8: Migrate `userApi` (FormData mutation for profile, plus password change)

**Files:**
- Create: `lib/queries/user.ts`
- Modify: `app/(dashboard)/dashboard/settings/page.tsx`
- Modify: `app/(buyer)/my-purchases/settings/page.tsx`
- Modify: `lib/queries/keys.ts`
- Modify: `store/index.ts`
- Delete: `store/api/userApi.ts`

- [ ] **Step 8.1: Create `lib/queries/user.ts`**

```ts
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useOptimisticMutation } from "@/lib/react-query/use-optimistic-mutation"

export interface UserProfile {
  id: string
  email: string
  name: string
  avatarUrl?: string | null
  role: string
  isSeller: boolean
  storeUrl?: string | null
  planType: string
  kycStatus: string
  onboardingComplete: boolean
  followersCount: number
  totalProducts: number
  totalSales: number
  totalRevenue: string
  createdAt: string
}

export const userKeys = {
  all: ["user"] as const,
  profile: () => [...userKeys.all, "profile"] as const,
  storeUrlCheck: (slug: string) => [...userKeys.all, "store-url", slug] as const,
} as const

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return (await res.json()) as T
}

export function useProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => getJSON<UserProfile>("/api/user/profile"),
  })
}

export function useUpdateProfile() {
  return useOptimisticMutation<FormData, UserProfile, UserProfile | undefined>({
    mutationFn: async (form) => {
      const res = await fetch("/api/user/profile", { method: "PUT", body: form })
      if (!res.ok) throw new Error("Failed to update profile")
      return (await res.json()) as UserProfile
    },
    invalidateKeys: [userKeys.profile()],
    optimistic: {
      queryKey: userKeys.profile(),
      updater: (old) => old,
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (input: { currentPassword: string; newPassword: string }) => {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error ?? "Failed to change password")
      }
      return (await res.json()) as { message: string }
    },
  })
}

export function useCheckStoreUrl() {
  const qc = useQueryClient()
  return {
    check: (storeUrl: string) =>
      qc.fetchQuery({
        queryKey: userKeys.storeUrlCheck(storeUrl),
        queryFn: () => getJSON<{ available: boolean }>(`/api/user/check-store-url/${storeUrl}`),
      }),
  }
}
```

(Note: the original `useLazyCheckStoreUrlQuery` was lazy-fetched on demand; we expose an imperative `check()` that uses `queryClient.fetchQuery` for the same behavior. If no consumer uses it today, the function still compiles and can be deleted later.)

- [ ] **Step 8.2: Re-export from keys.ts**

Append: `export { userKeys } from "./user"`

- [ ] **Step 8.3: Update `app/(dashboard)/dashboard/settings/page.tsx` (user side)**

- Replace `import { useUpdateProfileMutation, useChangePasswordMutation } from "@/store/api/userApi"` with `import { useUpdateProfile, useChangePassword } from "@/lib/queries/user"`.
- Replace `const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation()` with `const { mutateAsync: updateProfile, isPending: isUpdating } = useUpdateProfile()`.
- Replace `const [changePassword, { isLoading: isChangingPw }] = useChangePasswordMutation()` with `const { mutateAsync: changePassword, isPending: isChangingPw } = useChangePassword()`.
- Replace `.unwrap()` with plain awaits.

(Note: this file ALSO imports from `storefrontApi`. Don't touch those imports yet — Task 10 handles them.)

- [ ] **Step 8.4: Update `app/(buyer)/my-purchases/settings/page.tsx`**

- Replace `import { useGetProfileQuery, useUpdateProfileMutation } from "@/store/api/userApi"` with `import { useProfile, useUpdateProfile } from "@/lib/queries/user"`.
- Replace `useGetProfileQuery()` with `useProfile()`.
- Replace `useUpdateProfileMutation()` with `useUpdateProfile()` and adjust the destructure.

- [ ] **Step 8.5: Remove `userApi` from `store/index.ts`**

- [ ] **Step 8.6: Delete `store/api/userApi.ts`**

- [ ] **Step 8.7: Verify build + smoke**

Run: `npm run lint && npm run build`
Smoke: settings (both seller and buyer) — change name + avatar; change password.

---

## Task 9: Migrate `productsApi` (the heaviest — list/detail/stats + 4 mutations with optimistic updates)

This is the largest migration unit. Read carefully.

**Files:**
- Create: `lib/queries/products.ts`
- Modify: `app/(dashboard)/dashboard/products/page.tsx`
- Modify: `app/(dashboard)/dashboard/products/[id]/edit/page.tsx`
- Modify: `app/(dashboard)/dashboard/page.tsx`
- Modify: `components/dashboard/ProductForm.tsx`
- Modify: `lib/queries/keys.ts`
- Modify: `store/index.ts`
- Delete: `store/api/productsApi.ts`

- [ ] **Step 9.1: Create `lib/queries/products.ts`**

```ts
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export interface Product {
  id: string
  storefrontId: string
  title: string
  description?: string | null
  price: string
  originalPrice?: string | null
  fileUrl?: string | null
  fileId?: string | null
  thumbnailUrl?: string | null
  thumbnailFileId?: string | null
  deliveryType: "download" | "external_link" | "manual"
  externalUrl?: string | null
  sellerContactEmail?: string | null
  sellerContactPhone?: string | null
  sellerContactWhatsapp?: string | null
  subscriptionDuration?: string | null
  seoTitle?: string | null
  seoKeywords?: string | null
  isActive: boolean
  stock?: number | null
  downloads: number
  views: number
  createdAt: string
  updatedAt: string
}

export interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  limit: number
}

export interface ProductStats {
  totalProducts: number
  activeProducts: number
  totalDownloads: number
  totalViews: number
}

export interface ProductsListFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
}

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: ProductsListFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  stats: () => [...productKeys.all, "stats"] as const,
} as const

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return (await res.json()) as T
}

export function useProducts(filters: ProductsListFilters = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => {
      const { page = 1, limit = 10, search, status } = filters
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (search) params.set("search", search)
      if (status) params.set("status", status)
      return getJSON<ProductsResponse>(`/api/products?${params}`)
    },
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getJSON<Product>(`/api/products/${id}`),
    enabled: Boolean(id),
  })
}

export function useProductStats() {
  return useQuery({
    queryKey: productKeys.stats(),
    queryFn: () => getJSON<ProductStats>("/api/products/stats"),
    // Match the previous `keepUnusedDataFor: 300` (5 min) behavior:
    gcTime: 300_000,
    staleTime: 30_000,
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (form: FormData) => {
      const res = await fetch("/api/products", { method: "POST", body: form })
      if (!res.ok) throw new Error("Failed to create product")
      return (await res.json()) as Product
    },
    onSuccess: (created) => {
      // Insert into every active products list cache (mirrors prior RTK behavior).
      const lists = qc.getQueriesData<ProductsResponse>({ queryKey: productKeys.lists() })
      for (const [key, value] of lists) {
        if (!value) continue
        qc.setQueryData<ProductsResponse>(key, {
          ...value,
          products: [created, ...value.products],
          total: value.total + 1,
        })
      }
      qc.invalidateQueries({ queryKey: productKeys.lists() })
      qc.invalidateQueries({ queryKey: productKeys.stats() })
    },
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: string; body: FormData }) => {
      const res = await fetch(`/api/products/${input.id}`, { method: "PUT", body: input.body })
      if (!res.ok) throw new Error("Failed to update product")
      return (await res.json()) as Product
    },
    onSuccess: (updated, { id }) => {
      qc.setQueryData(productKeys.detail(id), updated)
      qc.invalidateQueries({ queryKey: productKeys.lists() })
      qc.invalidateQueries({ queryKey: productKeys.detail(id) })
    },
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation<void, unknown, string, { snapshots: Array<[unknown, ProductsResponse | undefined]> }>({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete product")
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: productKeys.lists() })
      const lists = qc.getQueriesData<ProductsResponse>({ queryKey: productKeys.lists() })
      const snapshots: Array<[unknown, ProductsResponse | undefined]> = []
      for (const [key, value] of lists) {
        snapshots.push([key, value])
        if (!value) continue
        qc.setQueryData<ProductsResponse>(key, {
          ...value,
          products: value.products.filter((p) => p.id !== id),
          total: Math.max(0, value.total - 1),
        })
      }
      return { snapshots }
    },
    onError: (_err, _id, ctx) => {
      ctx?.snapshots.forEach(([key, value]) => qc.setQueryData(key as readonly unknown[], value))
    },
    onSettled: (_data, _err, id) => {
      qc.invalidateQueries({ queryKey: productKeys.lists() })
      qc.invalidateQueries({ queryKey: productKeys.detail(id) })
      qc.invalidateQueries({ queryKey: productKeys.stats() })
    },
  })
}

export function useToggleProductStatus() {
  const qc = useQueryClient()
  return useMutation<Product, unknown, string, { snapshots: Array<[unknown, ProductsResponse | undefined]> }>({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/products/${id}/toggle-status`, { method: "PATCH" })
      if (!res.ok) throw new Error("Failed to toggle status")
      return (await res.json()) as Product
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: productKeys.lists() })
      const lists = qc.getQueriesData<ProductsResponse>({ queryKey: productKeys.lists() })
      const snapshots: Array<[unknown, ProductsResponse | undefined]> = []
      for (const [key, value] of lists) {
        snapshots.push([key, value])
        if (!value) continue
        qc.setQueryData<ProductsResponse>(key, {
          ...value,
          products: value.products.map((p) =>
            p.id === id ? { ...p, isActive: !p.isActive } : p,
          ),
        })
      }
      return { snapshots }
    },
    onError: (_err, _id, ctx) => {
      ctx?.snapshots.forEach(([key, value]) => qc.setQueryData(key as readonly unknown[], value))
    },
    onSettled: (_data, _err, id) => {
      qc.invalidateQueries({ queryKey: productKeys.detail(id) })
    },
  })
}
```

- [ ] **Step 9.2: Re-export from keys.ts**

Append: `export { productKeys } from "./products"`

- [ ] **Step 9.3: Update `app/(dashboard)/dashboard/products/page.tsx`**

- Replace `import { useGetProductsQuery, useDeleteProductMutation, useToggleProductStatusMutation } from "@/store/api/productsApi"` with `import { useProducts, useDeleteProduct, useToggleProductStatus } from "@/lib/queries/products"`.
- `useGetProductsQuery({ page, limit, search })` → `useProducts({ page, limit, search })`.
- `const [deleteProduct] = useDeleteProductMutation()` → `const { mutateAsync: deleteProduct } = useDeleteProduct()`.
- `const [toggleStatus] = useToggleProductStatusMutation()` → `const { mutateAsync: toggleStatus } = useToggleProductStatus()`.
- Replace `await deleteProduct(id).unwrap()` with `await deleteProduct(id)`. Same for toggle.

- [ ] **Step 9.4: Update `app/(dashboard)/dashboard/products/[id]/edit/page.tsx`**

- Replace `import { useGetProductQuery } from "@/store/api/productsApi"` with `import { useProduct } from "@/lib/queries/products"`.
- `useGetProductQuery(id)` → `useProduct(id)`.

- [ ] **Step 9.5: Update `app/(dashboard)/dashboard/page.tsx`**

- Replace `import { useGetProductStatsQuery } from "@/store/api/productsApi"` with `import { useProductStats } from "@/lib/queries/products"`.
- `useGetProductStatsQuery()` → `useProductStats()`.

- [ ] **Step 9.6: Update `components/dashboard/ProductForm.tsx`**

- Replace the two imports:
  - `import { useCreateProductMutation, useUpdateProductMutation } from "@/store/api/productsApi"` → `import { useCreateProduct, useUpdateProduct } from "@/lib/queries/products"`.
  - `import type { Product } from "@/store/api/productsApi"` → `import type { Product } from "@/lib/queries/products"`.
- Replace:
  - `const [createProduct, { isLoading: isCreating }] = useCreateProductMutation()` → `const { mutateAsync: createProduct, isPending: isCreating } = useCreateProduct()`.
  - `const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation()` → `const { mutateAsync: updateProduct, isPending: isUpdating } = useUpdateProduct()`.
- Replace `.unwrap()` calls with plain awaits.

- [ ] **Step 9.7: Remove `productsApi` from `store/index.ts`**

- [ ] **Step 9.8: Delete `store/api/productsApi.ts`**

- [ ] **Step 9.9: Verify build + smoke (heavy)**

Run: `npm run lint && npm run build`
Smoke (must all work):
- `/dashboard` overview shows product stats.
- `/dashboard/products` lists products with optimistic delete (row vanishes instantly) and optimistic toggle (Switch flips instantly, reverts on error if forced).
- Create new product → returns to list → new product visible at top without manual refetch.
- Edit existing product → changes reflected on return.

---

## Task 10: Migrate `storefrontApi`

**Files:**
- Create: `lib/queries/storefront.ts`
- Modify: `app/(dashboard)/dashboard/storefront/page.tsx`
- Modify: `app/(dashboard)/dashboard/settings/page.tsx`
- Modify: `lib/queries/keys.ts`
- Modify: `store/index.ts`
- Delete: `store/api/storefrontApi.ts`

- [ ] **Step 10.1: Create `lib/queries/storefront.ts`**

```ts
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { Product } from "@/lib/db/schema"

export interface Storefront {
  id: string
  userId: string
  storeUrl?: string | null
  storeName?: string | null
  description?: string | null
  profileImageUrl?: string | null
  coverImageUrl?: string | null
  tagline?: string | null
  themeId: string
  primaryColor: string
  fontFamily: string
  isPublished: boolean
  platformFeeMode: "seller" | "buyer"
  upiId?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  contactWhatsapp?: string | null
  socialInstagram?: string | null
  socialTwitter?: string | null
  socialYoutube?: string | null
  socialWebsite?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string | null
  createdAt: string
  updatedAt: string
}

export interface PublicStorefront extends Storefront {
  products: Product[]
  seller?: {
    id: string
    name: string
    avatarUrl?: string | null
    followersCount: number
    totalSales: number
  }
}

export const storefrontKeys = {
  all: ["storefront"] as const,
  current: () => [...storefrontKeys.all, "current"] as const,
  public: (slug: string) => [...storefrontKeys.all, "public", slug] as const,
  slugCheck: (slug: string) => [...storefrontKeys.all, "slug-check", slug] as const,
  stats: () => [...storefrontKeys.all, "stats"] as const,
} as const

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return (await res.json()) as T
}

export function useStorefront() {
  return useQuery({
    queryKey: storefrontKeys.current(),
    queryFn: () => getJSON<Storefront>("/api/storefront"),
  })
}

export function usePublicStorefront(slug: string) {
  return useQuery({
    queryKey: storefrontKeys.public(slug),
    queryFn: () => getJSON<PublicStorefront>(`/api/storefront/public/${slug}`),
    enabled: Boolean(slug),
    gcTime: 3_600_000,
  })
}

export function useUpdateStorefront() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (form: FormData) => {
      const res = await fetch("/api/storefront", { method: "PUT", body: form })
      if (!res.ok) throw new Error("Failed to update storefront")
      return (await res.json()) as Storefront
    },
    onSuccess: (data) => {
      qc.setQueryData(storefrontKeys.current(), data)
      qc.invalidateQueries({ queryKey: storefrontKeys.current() })
    },
  })
}

export function useTogglePublish() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/storefront/toggle-publish", { method: "PATCH" })
      if (!res.ok) throw new Error("Failed to toggle publish")
      return (await res.json()) as { isPublished: boolean }
    },
    onSuccess: (data) => {
      qc.setQueryData<Storefront | undefined>(storefrontKeys.current(), (old) =>
        old ? { ...old, isPublished: data.isPublished } : old,
      )
      qc.invalidateQueries({ queryKey: storefrontKeys.current() })
    },
  })
}

export function useCheckSlug() {
  const qc = useQueryClient()
  return {
    check: (slug: string) =>
      qc.fetchQuery({
        queryKey: storefrontKeys.slugCheck(slug),
        queryFn: () => getJSON<{ available: boolean }>(`/api/storefront/check-slug/${slug}`),
      }),
  }
}

export function useStorefrontStats() {
  return useQuery({
    queryKey: storefrontKeys.stats(),
    queryFn: () =>
      getJSON<{ totalViews: number; totalRevenue: string; totalOrders: number }>(
        "/api/storefront/stats",
      ),
  })
}
```

- [ ] **Step 10.2: Re-export from keys.ts**

Append: `export { storefrontKeys } from "./storefront"`

- [ ] **Step 10.3: Update `app/(dashboard)/dashboard/storefront/page.tsx`**

- Replace `import { useGetStorefrontQuery, useUpdateStorefrontMutation, useTogglePublishMutation } from "@/store/api/storefrontApi"` with `import { useStorefront, useUpdateStorefront, useTogglePublish } from "@/lib/queries/storefront"`.
- Replace each hook call:
  - `useGetStorefrontQuery()` → `useStorefront()`.
  - `const [updateStorefront, { isLoading: isUpdating }] = useUpdateStorefrontMutation()` → `const { mutateAsync: updateStorefront, isPending: isUpdating } = useUpdateStorefront()`.
  - `const [togglePublish, { isLoading: isToggling }] = useTogglePublishMutation()` → `const { mutateAsync: togglePublish, isPending: isToggling } = useTogglePublish()`.
- Replace `.unwrap()` with plain awaits.

- [ ] **Step 10.4: Update `app/(dashboard)/dashboard/settings/page.tsx`**

- Replace `import { useGetStorefrontQuery, useUpdateStorefrontMutation } from "@/store/api/storefrontApi"` with `import { useStorefront, useUpdateStorefront } from "@/lib/queries/storefront"`.
- Replace `const { data: storefront, isLoading: storefrontLoading } = useGetStorefrontQuery()` with `const { data: storefront, isLoading: storefrontLoading } = useStorefront()`.
- Replace `const [updateStorefront, { isLoading: isSavingFee }] = useUpdateStorefrontMutation()` with `const { mutateAsync: updateStorefront, isPending: isSavingFee } = useUpdateStorefront()`.
- Replace `.unwrap()` with plain awaits.

- [ ] **Step 10.5: Remove `storefrontApi` from `store/index.ts`**

- [ ] **Step 10.6: Delete `store/api/storefrontApi.ts`**

- [ ] **Step 10.7: Verify build + smoke**

Run: `npm run lint && npm run build`
Smoke: `/dashboard/storefront` loads, edit + save persists, publish toggle flips, public store at `/store/<slug>` still renders (public page is server-rendered and doesn't use the hooks). `/dashboard/settings` platform-fee section saves correctly.

---

## Task 11: Migrate `authApi` (last — auth flows)

**Files:**
- Create: `lib/queries/auth.ts`
- Modify: `app/(auth)/signup/page.tsx`
- Modify: `app/(auth)/verify-email/page.tsx`
- Modify: `app/(auth)/forgot-password/page.tsx`
- Modify: `app/(auth)/reset-password/page.tsx`
- Modify: `lib/queries/keys.ts`
- Modify: `store/index.ts`
- Delete: `store/api/authApi.ts`

- [ ] **Step 11.1: Create `lib/queries/auth.ts`**

```ts
"use client"

import { useMutation } from "@tanstack/react-query"

async function postJSON<TIn, TOut>(url: string, body: TIn): Promise<TOut> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errBody = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(errBody?.error ?? `Request failed: ${res.status}`)
  }
  return (await res.json()) as TOut
}

export function useSignup() {
  return useMutation({
    mutationFn: (input: { name: string; email: string; password: string; role: string }) =>
      postJSON<typeof input, { message: string; email: string }>("/api/auth/signup", input),
  })
}

export function useVerifyOTP() {
  return useMutation({
    mutationFn: (input: { email: string; otp: string }) =>
      postJSON<typeof input, { success: boolean }>("/api/auth/verify-email", input),
  })
}

export function useResendOTP() {
  return useMutation({
    mutationFn: (input: { email: string }) =>
      postJSON<typeof input, { message: string }>("/api/auth/resend-otp", input),
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: { email: string }) =>
      postJSON<typeof input, { message: string }>("/api/auth/forgot-password", input),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: { token: string; password: string }) =>
      postJSON<typeof input, { message: string }>("/api/auth/reset-password", input),
  })
}
```

- [ ] **Step 11.2: Update `app/(auth)/signup/page.tsx`**

- Replace `import { useSignupMutation } from "@/store/api/authApi"` with `import { useSignup } from "@/lib/queries/auth"`.
- Replace `const [signup, { isLoading }] = useSignupMutation()` with `const { mutateAsync: signup, isPending: isLoading } = useSignup()`.
- Replace `.unwrap()` with plain awaits.

- [ ] **Step 11.3: Update `app/(auth)/verify-email/page.tsx`**

- Replace `import { useVerifyOTPMutation, useResendOTPMutation } from "@/store/api/authApi"` with `import { useVerifyOTP, useResendOTP } from "@/lib/queries/auth"`.
- Replace `const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation()` with `const { mutateAsync: verifyOTP, isPending: isVerifying } = useVerifyOTP()`.
- Replace `const [resendOTP, { isLoading: isResending }] = useResendOTPMutation()` with `const { mutateAsync: resendOTP, isPending: isResending } = useResendOTP()`.
- Replace `.unwrap()` with plain awaits.

- [ ] **Step 11.4: Update `app/(auth)/forgot-password/page.tsx`**

Same pattern as 11.2 with `useForgotPassword`.

- [ ] **Step 11.5: Update `app/(auth)/reset-password/page.tsx`**

Same pattern as 11.2 with `useResetPassword`.

- [ ] **Step 11.6: Remove `authApi` from `store/index.ts`**

After this step, `store/index.ts` should have an **empty** `reducer` block (no slices left) and no `.concat(...)` arguments. The store still exists but is empty. We delete it next.

- [ ] **Step 11.7: Delete `store/api/authApi.ts`**

- [ ] **Step 11.8: Verify build + smoke**

Run: `npm run lint && npm run build`
Smoke: signup → verify OTP → forgot-password → reset-password → login. All flows complete.

---

## Task 12: Final Cleanup — delete `store/`, drop Redux deps, simplify providers

After Task 11, `store/index.ts` is empty of RTK Query slices. The Redux Provider is mounted in `app/providers.tsx` but holds no state anyone reads. Time to remove it.

**Files:**
- Modify: `app/providers.tsx`
- Modify: `package.json`
- Delete: `store/api/` (already empty)
- Delete: `store/slices/authSlice.ts`
- Delete: `store/slices/uiSlice.ts`
- Delete: `store/slices/` (folder)
- Delete: `store/hooks.ts`
- Delete: `store/index.ts`
- Delete: `store/providers.tsx`
- Delete: `store/` (folder)
- Delete: `hooks/use-mutation-toast.ts`

- [ ] **Step 12.1: Simplify `app/providers.tsx` (drop Redux Provider)**

Replace the file contents with:

```tsx
"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import type { Session } from "next-auth"
import { ReactQueryProvider } from "@/lib/react-query/provider"
import { AuthSync } from "./auth-sync"

interface ProvidersProps {
  children: React.ReactNode
  session?: Session | null
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <ReactQueryProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthSync />
          {children}
        </ThemeProvider>
      </ReactQueryProvider>
    </SessionProvider>
  )
}
```

- [ ] **Step 12.2: Delete `hooks/use-mutation-toast.ts`**

Run: `rm d:/Shikhar/genzaic-creator-hub/genzaic-next/hooks/use-mutation-toast.ts`

- [ ] **Step 12.3: Delete the entire `store/` directory**

Run: `rm -rf d:/Shikhar/genzaic-creator-hub/genzaic-next/store`

- [ ] **Step 12.4: Remove Redux dependencies from `package.json`**

Run: `npm uninstall @reduxjs/toolkit react-redux redux-persist`

- [ ] **Step 12.5: Verify the final build**

Run: `npm run lint && npm run build`
Expected: both pass with no Redux packages installed.

- [ ] **Step 12.6: Sweep for any lingering imports**

Run a code search to confirm no Redux references remain:

Grep: `from "@/store` — expected: zero results.
Grep: `@reduxjs/toolkit|react-redux|redux-persist` — expected: zero results.

- [ ] **Step 12.7: Final smoke pass (full app)**

Manual end-to-end smoke pass:
1. Public store (`/store/<slug>`) renders.
2. Signup → OTP verify → login.
3. Onboarding flow + plan selection.
4. Dashboard overview (stats + recent orders).
5. Products list with optimistic toggle + delete; create new product; edit existing product.
6. Storefront editor: edit + save + publish/unpublish.
7. KYC submit.
8. Sales list, payouts list.
9. Settings (profile name + avatar; password change; platform fee mode).
10. Buyer my-purchases list + order detail; checkout flow on a published product → download page.

All ten flows must work. If any breaks, the most likely culprit is a missed `.unwrap()` removal or a hook field rename — search the file and adjust.

---

## Self-Review Checklist (run by the executing agent before declaring done)

- [ ] No `from "@/store/..."` imports anywhere in the repo.
- [ ] No `@reduxjs/toolkit`, `react-redux`, `redux-persist` packages in `package.json`.
- [ ] `store/` directory does not exist.
- [ ] `lib/react-query/`, `lib/queries/`, `lib/stores/auth.ts`, `hooks/use-sync-auth-store.ts`, `app/providers.tsx`, `app/auth-sync.tsx` all exist.
- [ ] `lib/queries/keys.ts` re-exports every per-resource key factory.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] React Query Devtools panel appears in development.
- [ ] All ten smoke-pass items in Step 12.7 work.
