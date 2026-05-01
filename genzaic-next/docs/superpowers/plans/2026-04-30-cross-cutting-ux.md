# A2 — Cross-cutting UX (Breadcrumbs + Confirm) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship `<Breadcrumbs items=[...] />` and `useConfirm()` so dashboard pages can drop them in and the products page can replace its inline AlertDialog with the new hook.

**Architecture:** shadcn `breadcrumb` primitive → thin `<Breadcrumbs>` wrapper. `<ConfirmProvider>` mounted in `app/providers.tsx` exposes context-driven `useConfirm()` returning `Promise<boolean>`.

**Tech stack:** Next.js 15, shadcn/ui, Radix `AlertDialog`, TypeScript strict.

**No tests, no commits in this plan** (matches A1 conventions).

---

## Task 1: Install shadcn breadcrumb + create `<Breadcrumbs>` wrapper

**Files:**
- Create: `components/ui/breadcrumb.tsx` (via shadcn install)
- Create: `components/layout/Breadcrumbs.tsx`

- [ ] **Step 1.1: Install shadcn breadcrumb**

Run: `npx shadcn@latest add breadcrumb --yes`
Expected: `components/ui/breadcrumb.tsx` is added. Confirm with `ls components/ui/breadcrumb.tsx`.

If the install pulls in `@radix-ui/react-slot` (already a dep) or any other already-installed package, that's fine.

- [ ] **Step 1.2: Create `components/layout/Breadcrumbs.tsx`**

```tsx
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Fragment } from "react"

export interface BreadcrumbEntry {
  label: string
  href?: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbEntry[] }) {
  if (items.length === 0) return null
  if (items.length === 1 && !items[0].href) return null

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <Fragment key={`${item.label}-${index}`}>
              <BreadcrumbItem>
                {isLast || !item.href ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
```

- [ ] **Step 1.3: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

---

## Task 2: Build `useConfirm()` hook + `<ConfirmProvider>`

**Files:**
- Create: `lib/react/confirm.tsx`

- [ ] **Step 2.1: Create the provider + hook**

```tsx
"use client"

import { createContext, useCallback, useContext, useState, type ReactNode } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export interface ConfirmOptions {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

interface ConfirmContextValue {
  ask: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

interface PendingConfirm {
  options: ConfirmOptions
  resolve: (value: boolean) => void
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null)

  const ask = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ options, resolve })
    })
  }, [])

  const handleResolve = (value: boolean) => {
    pending?.resolve(value)
    setPending(null)
  }

  return (
    <ConfirmContext.Provider value={{ ask }}>
      {children}
      <AlertDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) handleResolve(false)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pending?.options.title}</AlertDialogTitle>
            {pending?.options.description && (
              <AlertDialogDescription>{pending.options.description}</AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleResolve(false)}>
              {pending?.options.cancelText ?? "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleResolve(true)}
              className={pending?.options.danger ? "bg-destructive hover:bg-destructive/90" : undefined}
            >
              {pending?.options.confirmText ?? "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error("useConfirm must be used inside ConfirmProvider")
  return ctx.ask
}
```

- [ ] **Step 2.2: Mount `<ConfirmProvider>` in `app/providers.tsx`**

Modify `app/providers.tsx`:

```tsx
"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import type { Session } from "next-auth"
import { ReactQueryProvider } from "@/lib/react-query/provider"
import { ConfirmProvider } from "@/lib/react/confirm"
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
          <ConfirmProvider>
            <AuthSync />
            {children}
          </ConfirmProvider>
        </ThemeProvider>
      </ReactQueryProvider>
    </SessionProvider>
  )
}
```

- [ ] **Step 2.3: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

---

## Task 3: Replace inline AlertDialog in products list with `useConfirm()`

**Files:**
- Modify: `app/(dashboard)/dashboard/products/page.tsx`

- [ ] **Step 3.1: Refactor the products page delete flow**

In `app/(dashboard)/dashboard/products/page.tsx`:

1. Add import: `import { useConfirm } from "@/lib/react/confirm"`.
2. Inside the component: `const confirm = useConfirm()`.
3. Replace `handleDelete` to take title + id and gate behind confirm:
```tsx
const handleDelete = async (id: string, title: string) => {
  const ok = await confirm({
    title: "Delete product?",
    description: `This will permanently delete "${title}". This action cannot be undone.`,
    confirmText: "Delete",
    danger: true,
  })
  if (!ok) return
  try {
    await deleteProduct(id)
    toast.success("Product deleted")
  } catch (err) {
    toast.error(getApiErrorMessage(err, "Failed to delete product"))
  }
}
```
4. Remove the imports for `AlertDialog`, `AlertDialogAction`, `AlertDialogCancel`, `AlertDialogContent`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogTrigger`.
5. Replace the `<AlertDialog>...</AlertDialog>` block in each row with a single button that calls `handleDelete(product.id, product.title)`:
```tsx
<Button
  variant="ghost"
  size="icon"
  className="text-destructive hover:text-destructive"
  onClick={() => handleDelete(product.id, product.title)}
>
  <Trash2 className="h-4 w-4" />
</Button>
```

- [ ] **Step 3.2: Type-check + build**

Run: `npx tsc --noEmit && npm run build`
Expected: both pass.

---

## Task 4: Add breadcrumbs to product edit page (worked example)

**Files:**
- Modify: `app/(dashboard)/dashboard/products/[id]/edit/page.tsx`

- [ ] **Step 4.1: Drop in `<Breadcrumbs>` at the top of the rendered page**

```tsx
import { Breadcrumbs } from "@/components/layout/Breadcrumbs"

// inside the component, replace the final `return <ProductForm ... />` with:
return (
  <div className="space-y-4">
    <Breadcrumbs items={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Products", href: "/dashboard/products" },
      { label: product.title },
    ]} />
    <ProductForm mode="edit" product={product} />
  </div>
)
```

- [ ] **Step 4.2: Type-check + build**

Run: `npx tsc --noEmit && npm run build`
Expected: both pass.

---

## Self-review checklist

- [ ] `<Breadcrumbs />` renders correctly on `/dashboard/products/<id>/edit`.
- [ ] Clicking the Trash icon on `/dashboard/products` opens the confirm dialog; "Delete" deletes (optimistic), "Cancel" / Esc dismisses without deleting.
- [ ] No type or build errors.
- [ ] No leftover imports of `AlertDialog*` in the products list page.
