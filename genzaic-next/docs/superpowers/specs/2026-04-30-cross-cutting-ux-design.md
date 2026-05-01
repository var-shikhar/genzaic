# A2 — Cross-cutting UX: Breadcrumbs + Confirmation Dialog

**Date:** 2026-04-30
**Status:** Approved (design)
**Phase:** A2 (after A1 state migration)

## 1. Goal

Add two reusable UI primitives that the spec calls out as global config: page-level breadcrumbs and a global confirmation-dialog hook. Both are foundational for A3/A4.

## 2. Decisions

| # | Decision |
|---|---|
| Q1 | Per-page explicit `<Breadcrumbs items={[...]} />`. No auto-derivation, no override hook. |
| Q2 | Page-owned: each page that wants a breadcrumb renders the component inline at the top of its content. Scrolls with the page (not sticky). Pages that don't render `<Breadcrumbs>` show nothing. |
| Q3 | Imperative `useConfirm()` hook. A single global `<ConfirmDialog>` mounted at the providers level. Call sites collapse to `if (await confirm({ title, description, danger: true })) { ... }`. |
| Q4 | Install shadcn `breadcrumb` component as the visual primitive. |

## 3. Components

### 3.1 `components/ui/breadcrumb.tsx`
Standard shadcn breadcrumb (installed via `npx shadcn@latest add breadcrumb`). Provides `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`.

### 3.2 `components/layout/Breadcrumbs.tsx`
Thin wrapper around shadcn primitives. Accepts an array of items and renders the chain.

```tsx
export interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) { ... }
```

Behavior:
- Last item is rendered as `<BreadcrumbPage>` (no link, current-page styling).
- Items with `href` render as `<BreadcrumbLink>` using Next.js `<Link>`.
- Items without `href` (other than the last) render as plain text.
- Renders `null` if `items` is empty or only has one element with no href (single label is meaningless as a breadcrumb).

### 3.3 `components/ui/confirm-dialog.tsx`
The visual confirm dialog (built on top of existing `<AlertDialog>`). Pure presentational — receives state from the provider.

### 3.4 `lib/react/confirm.tsx` (the hook + provider)

Exports:
- `<ConfirmProvider>` — mounted once at the providers level. Owns the confirm state and renders `<ConfirmDialog>`.
- `useConfirm()` — returns a function `(opts: ConfirmOptions) => Promise<boolean>`.

```ts
export interface ConfirmOptions {
  title: string
  description?: string
  confirmText?: string      // default "Confirm"
  cancelText?: string       // default "Cancel"
  danger?: boolean          // default false → red confirm button when true
}
```

How it works internally:
- A React context holds `{ ask: (opts) => Promise<boolean> }`.
- `ask()` sets local state with the opts and a `resolve` function, then returns the promise.
- The user clicking Confirm/Cancel resolves the promise with `true`/`false` and clears state.
- Closing the dialog without choosing (Esc, click outside) resolves with `false`.

## 4. Provider Tree

`app/providers.tsx` gets one new wrapper:

```
SessionProvider
└── ReactQueryProvider
      └── ThemeProvider
            └── ConfirmProvider           ← NEW
                  ├── AuthSync
                  └── {children}
```

The dialog itself is rendered inside `<ConfirmProvider>`, so it's available everywhere.

## 5. Migration of existing confirmation dialogs

Today, `app/(dashboard)/dashboard/products/page.tsx` uses an inline `<AlertDialog>` for product delete. After this spec, it becomes:

```tsx
const confirm = useConfirm()
const handleDelete = async (id: string, title: string) => {
  if (!(await confirm({
    title: "Delete product?",
    description: `This will permanently delete "${title}". This action cannot be undone.`,
    confirmText: "Delete",
    danger: true,
  }))) return
  await deleteProduct(id)
  toast.success("Product deleted")
}
```

The local `<AlertDialog>` JSX is removed.

## 6. Acceptance criteria

- `npx shadcn@latest add breadcrumb` succeeds; component present at `components/ui/breadcrumb.tsx`.
- `<Breadcrumbs />` renders a chain on any page that imports it; renders nothing if `items.length <= 1` and only label.
- `useConfirm()` returns a promise that resolves to `true` on confirm and `false` on cancel/dismiss.
- Existing product delete on `/dashboard/products` works through the new `useConfirm()` and the inline `<AlertDialog>` block is removed.
- `npm run build` and `npx tsc --noEmit` pass.

## 7. Out of scope

- Adding `<Breadcrumbs />` to every page now. Only product-edit and product-detail get one as part of this spec; A3 will introduce more as it overhauls those pages. Other pages can be retrofitted on demand.
- Replacing every other `<AlertDialog>` in the codebase. Only the product delete confirmation gets migrated as a worked example. Future delete/patch confirmations should use `useConfirm()` going forward.
