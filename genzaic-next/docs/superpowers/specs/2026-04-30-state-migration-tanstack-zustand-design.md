# A1 — State Migration: Redux Toolkit + RTK Query → TanStack Query + Zustand

**Date:** 2026-04-30
**Status:** Approved (design)
**Phase:** A1 (precedes Phase A2/A3/A4)

## 1. Goal

Replace the current Redux Toolkit + RTK Query data layer with **TanStack Query** (server state) + **Zustand** (client state). Every screen must continue to behave identically; only the underlying state-management library changes.

This migration unblocks the rest of Phase A:
- A2 — Cross-cutting UX (Breadcrumbs, confirmation dialog abstraction)
- A3 — Product CRUD overhaul (gallery, fast-path UX, settings-driven defaults)
- A4 — Storefront 2-pane editor with live preview

Those will be designed in fresh brainstorming sessions against the foundation laid here.

## 2. Decisions Reference

The decisions below are the result of brainstorming Q1–Q11. Listed for traceability.

| # | Decision |
|---|---|
| Q1 | Migrate everything first (A1 only); A2/A3/A4 happen after. |
| Q2 | Zustand persists auth user fields only. NextAuth session remains source of truth. |
| Q3 | TanStack Query library defaults (`staleTime: 0`, refetch on focus/reconnect/mount); Devtools enabled in development. |
| Q4 | Provide a `useOptimisticMutation()` wrapper hook (snapshot/rollback/invalidate). |
| Q5 | Mixed mutation shape: JSON when no files; `FormData` for file-uploading mutations. ImageKit remains the upload destination; server-side flow unchanged. |
| Q6 | Hierarchical query key factories per resource. |
| Q7 | Coexist during migration, slice-by-slice (single branch, sequential commits). Git is operated manually by the user. |
| Q8 | Sync from `useSession()` into `useAuthStore` via a `useSyncAuthStore` hook in the root layout. |
| Q9a | Drop `uiSlice` entirely. `sidebarOpen` becomes local state in `DashboardLayout`. `activeTab` becomes URL search params. |
| Q9b | Fold toast logic into `useOptimisticMutation` (single hook accepts optional `toastOptions`). `useMutationToast` helper goes away. |
| Q10 | Query hooks live under `lib/queries/`, one file per resource. |
| Q11 | Auth Zustand store lives at `lib/stores/auth.ts`. The `store/` directory is deleted at the end of migration. |

## 3. Target Folder Layout

```
lib/
├── queries/                      # one file per resource
│   ├── keys.ts                   # central re-export of all key factories
│   ├── ai.ts                     # useAiExtract
│   ├── auth.ts                   # signup, OTP verify/resend, forgot/reset password
│   ├── buyer.ts                  # buyer orders
│   ├── checkout.ts               # product info, create order, record download
│   ├── kyc.ts                    # get/submit/delete KYC
│   ├── onboarding.ts
│   ├── payouts.ts                # stats, payouts list
│   ├── products.ts               # CRUD + toggle status
│   ├── sales.ts                  # stats, orders, recent orders
│   ├── storefront.ts             # get/update, toggle publish, check slug
│   └── user.ts                   # profile, password change, check store URL
├── stores/
│   └── auth.ts                   # useAuthStore (Zustand, persisted)
└── react-query/
    ├── query-client.ts           # singleton QueryClient with library defaults
    ├── provider.tsx              # QueryClientProvider + ReactQueryDevtools
    ├── use-optimistic-mutation.ts# wrapper with snapshot/rollback + optional toast
    └── run-mutation.ts           # one-off toast wrapper for non-optimistic cases

hooks/
└── use-sync-auth-store.ts        # bridges useSession() → useAuthStore
```

**Removed at end of migration:**
- `store/` (entire directory: `api/`, `slices/`, `index.ts`, `hooks.ts`, `providers.tsx`)
- `hooks/use-mutation-toast.ts` (replaced by `lib/react-query/run-mutation.ts`)

**Renamed:** `store/providers.tsx` is replaced by a new `app/providers.tsx` that wires the new tree.

## 4. Key Building Blocks

### 4.1 Query Key Factories

Each `lib/queries/<resource>.ts` exports a hierarchical key factory.

```ts
// lib/queries/products.ts
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: { page?: number; search?: string }) =>
    [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
}
```

`lib/queries/keys.ts` re-exports every factory so call sites can import from one place if preferred.

### 4.2 `useOptimisticMutation`

```ts
useOptimisticMutation<TInput, TData, TQueryData>({
  mutationFn: (input: TInput) => Promise<TData>,
  optimistic?: {
    queryKey: QueryKey,
    updater: (old: TQueryData | undefined, input: TInput) => TQueryData,
  },
  invalidateKeys?: QueryKey[],          // defaults to [optimistic.queryKey] if provided
  toast?: {
    success?: string,
    error?: string,
    loading?: string,                   // when present, uses toast.promise
  },
})
```

Behavior:
- On `onMutate`: cancels outgoing queries on `queryKey`, snapshots current data, applies `updater`.
- On `onError`: restores snapshot, fires error toast if configured.
- On `onSuccess`: fires success toast if configured.
- On `onSettled`: invalidates `invalidateKeys` (or `[queryKey]`).

### 4.3 `runMutation`

A small standalone helper for one-off mutations that don't need optimistic logic:

```ts
await runMutation(mutation.mutateAsync(input), {
  success: "Saved",
  error: "Save failed",
  loading?: "Saving...",
})
```

Returns the resolved value on success, `undefined` on failure (the toast is the error UI). Mirrors today's `runMutation` ergonomics so call sites change minimally.

### 4.4 Auth Store (Zustand)

```ts
// lib/stores/auth.ts
type AuthUser = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  storeUrl?: string | null
  isSeller?: boolean
  role?: "buyer" | "seller"
}

useAuthStore = create(
  persist<{ user: AuthUser | null; setUser: (u: AuthUser | null) => void; clear: () => void }>(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clear: () => set({ user: null }),
    }),
    { name: "genzaic-auth", storage: createJSONStorage(() => localStorage) },
  ),
)
```

Only `user` is persisted (Q2).

### 4.5 `useSyncAuthStore`

Runs once in the root layout client wrapper. Watches `useSession()` and calls `setUser` / `clear` on change. Components elsewhere read from `useAuthStore` for instant access without waiting on session resolution.

## 5. Provider Tree

`app/providers.tsx` (new file, replaces `store/providers.tsx`):

```
SessionProvider
  └── QueryClientProvider                  // new
        └── ThemeProvider
              ├── ReactQueryDevtools       // dev only
              └── {children}
```

`useSyncAuthStore()` is called from a small client component placed inside `SessionProvider` (so it has session access) but outside the screen content (e.g. wrapping `{children}` in `app/layout.tsx`). No more `<Provider store={store}>`. `redux-persist` wrapper removed.

## 6. UI State Reorganization (post Q9a)

`uiSlice` is deleted. Its two fields move:

- **`sidebarOpen`** → local `useState` in `components/layout/DashboardLayout.tsx`. The toggle button stays in the same place; only the source of truth moves.
- **`activeTab`** → URL search params. Tab components read `useSearchParams()` and write via `router.replace(?tab=...)`. Shareable links benefit; per-page tab UIs (storefront editor, settings) are simpler.

If any screen relied on `activeTab` being remembered across navigation, that behavior is replaced by URL persistence — better, not worse.

## 7. Mutation Shape Conventions (post Q5)

| Mutation kind | Shape | Examples |
|---|---|---|
| **JSON in, JSON out** | `mutationFn: (input: TInput) => fetch().then(r => r.json())` | toggle product status, delete product, change password, OTP verify, publish toggle, create order |
| **FormData in, JSON out** | `mutationFn: (form: FormData) => fetch({ body: form }).then(r => r.json())` | product create/update (with thumbnail + product file), storefront update (profile + cover), profile update (avatar), KYC submit (docs) |

Server endpoints are unchanged. ImageKit upload remains a server-side concern.

## 8. Migration Order (single branch, sequential)

Each step is independently verifiable: at each checkpoint the app builds, lints clean, and every screen still works.

1. **Setup** — install deps, create `lib/react-query/`, `lib/queries/keys.ts`, `lib/stores/auth.ts`, `app/providers.tsx`. Mount `QueryClientProvider` alongside the existing Redux `Provider`. Replace `store/providers.tsx` consumer in `app/layout.tsx` with the new `app/providers.tsx`, but it still renders the Redux Provider too (coexistence).

2. **Migrate slices, least-coupled first.** For each slice:
   - Add `lib/queries/<resource>.ts` with key factory + hooks (mirroring the shape and arguments of the RTK Query hooks).
   - Replace consumer imports throughout `app/` and `components/`.
   - Remove the slice's reducer + middleware from `store/index.ts`.
   - Delete `store/api/<slice>.ts`.

   Order:
   1. `aiApi` (single mutation, used in `AIExtractionModal`)
   2. `payoutsApi`
   3. `buyerApi`
   4. `salesApi`
   5. `kycApi`
   6. `onboardingApi`
   7. `checkoutApi`
   8. `userApi`
   9. `productsApi` (CRUD + toggle — first non-trivial optimistic update)
   10. `storefrontApi` (get/update + toggle publish)
   11. `authApi` (mutations only; consumers also depend on `authSlice` so this is last)

3. **Cut over auth state.**
   - Replace any `authSlice` consumer with `useAuthStore`.
   - Insert `useSyncAuthStore()` into the root client wrapper.
   - Delete `authSlice`, `uiSlice` (after step 4).

4. **UI state cleanup.**
   - Move `sidebarOpen` to local state in `DashboardLayout`.
   - Move `activeTab` to URL search params on every page that used it.
   - Delete `uiSlice`.

5. **Final cleanup.**
   - Delete `store/` directory.
   - Delete `hooks/use-mutation-toast.ts`.
   - Remove `@reduxjs/toolkit`, `react-redux`, `redux-persist` from `package.json`.
   - `npm run build && npm run lint` — both must pass.

## 9. Acceptance Criteria

- `npm run build` and `npm run lint` pass after every numbered step in §8.
- Every existing screen works identically end-to-end:
  - Auth: signup → OTP verify → login → forgot/reset password.
  - Dashboard: products CRUD with optimistic toggle and optimistic delete; storefront edit + publish; KYC submit; payouts/sales views; settings profile + password + platform fee.
  - Buyer: my-purchases list; checkout flow; download.
  - Public store: `/store/[storeUrl]` renders; product detail renders.
- No imports remain from `@reduxjs/toolkit`, `react-redux`, `redux-persist`, or `@/store/*`.
- TanStack Query Devtools panel is visible in development.
- `npm run build` succeeds without `redux*` or `@reduxjs/*` packages installed.

## 10. Out of Scope (Explicit)

- **Phase A2** — Breadcrumbs, global confirmation dialog abstraction.
- **Phase A3** — Product gallery, fast-path UX, settings-driven defaults, removal of SEO Title from Product form.
- **Phase A4** — 2-pane storefront editor with live preview.
- **API route changes** — server-side endpoints are not touched.
- **Tests** — no test suite exists currently; not adding one as part of this migration.
- **Database changes** — schema is not touched.

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Optimistic-update parity bugs (toggle/delete) | `useOptimisticMutation` is built and exercised first in `productsApi` migration; reuse it everywhere after. |
| Coexistence period leaves the app in a half-migrated state if work pauses | Each slice migration is its own self-contained step; the app is fully functional at every checkpoint. |
| `useSession()` has loading state on initial render → flash of empty user | `useAuthStore` is persisted; the persisted snapshot is read synchronously, so first paint already has user data. |
| Search-param-driven `activeTab` breaks deep linking from old in-memory tab state | None to mitigate — URL state is strictly an upgrade. |
