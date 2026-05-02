"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useProducts, useDeleteProduct, useToggleProductStatus } from "@/lib/queries/products"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { getApiErrorMessage } from "@/lib/api-error"
import { useConfirm } from "@/lib/react/confirm"
import { QuickAddProductModal } from "@/components/dashboard/QuickAddProductModal"
import { CatalogRow } from "@/components/dashboard/CatalogRow"
import { EditorsHeadline, EyebrowLabel } from "@/components/brand/primitives"
import { InkWash } from "@/components/brand/motifs"
import { PublishRitual } from "@/components/brand/PublishRitual"
import { TOAST, EMPTY } from "@/lib/brand/voice"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type Filter = "all" | "live" | "drafts"

export default function CatalogPage() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<Filter>("all")
  const [addOpen, setAddOpen] = useState(false)
  const [ritual, setRitual] = useState<{ productTitle: string; hexCode: string; storeSlug?: string | null } | null>(null)
  const debouncedSearch = useDebouncedValue(search, 300)

  const { data, isLoading } = useProducts({
    page: 1,
    limit: 50,
    search: debouncedSearch || undefined,
  })
  const { mutateAsync: deleteProduct } = useDeleteProduct()
  const { mutateAsync: toggleStatus } = useToggleProductStatus()
  const confirm = useConfirm()

  const handleDelete = async (id: string, title: string) => {
    const ok = await confirm({
      title: "Pull from the catalog?",
      description: `This permanently removes "${title}". The hex code is freed and reusable.`,
      confirmText: "Pull",
      danger: true,
    })
    if (!ok) return
    try {
      await deleteProduct(id)
      toast.success(TOAST.productDeleted)
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to delete"))
    }
  }

  const handleToggle = async (id: string, nextActive: boolean, hex?: string | null, title?: string) => {
    try {
      await toggleStatus(id)
      if (nextActive && hex && title) {
        setRitual({ productTitle: title, hexCode: hex, storeSlug: null })
      } else {
        toast.success(nextActive
          ? (hex ? TOAST.publishedFallback(hex) : TOAST.published)
          : TOAST.unpublished)
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update status"))
    }
  }

  const products = data?.products ?? []
  const filtered = products.filter((p) =>
    filter === "all" ? true : filter === "live" ? p.isActive : !p.isActive,
  )
  const liveCount = products.filter((p) => p.isActive).length

  return (
    <div className="space-y-8">
      <header className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-8 items-end pb-6 border-b border-primary/30">
        <div>
          <EyebrowLabel>Your catalog · {data?.total ?? 0} products</EyebrowLabel>
          <EditorsHeadline size="hero" className="mt-2">Products.</EditorsHeadline>
          <p className="font-display italic text-base text-muted-foreground mt-2">
            {data?.total ?? 0} {data?.total === 1 ? "piece" : "pieces"}.
            {liveCount > 0 ? ` ${liveCount} in motion.` : ""}
          </p>
        </div>
      </header>

      <div className="flex items-center gap-4 py-2 border-b border-primary/30/15 flex-wrap">
        <input
          placeholder="⌕  Search the catalog —"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] font-body text-sm bg-transparent border-0 focus:outline-none py-1"
        />
        <FilterPill label="All"    active={filter === "all"}    onClick={() => setFilter("all")} />
        <FilterPill label="Live"   active={filter === "live"}   onClick={() => setFilter("live")} />
        <FilterPill label="Drafts" active={filter === "drafts"} onClick={() => setFilter("drafts")} />
        <button
          onClick={() => setAddOpen(true)}
          className="font-body text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-foreground/90 transition-colors"
        >
          + File a new piece
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <CatalogEmpty onAdd={() => setAddOpen(true)} />
      ) : (
        <ul>
          {filtered.map((product, i) => (
            <li key={product.id}>
              <CatalogRow
                product={product as Product & { hexCode: string | null }}
                index={i + 1}
                onToggle={(next) => handleToggle(product.id, next, product.hexCode, product.title)}
                onDelete={() => handleDelete(product.id, product.title)}
              />
            </li>
          ))}
        </ul>
      )}

      <QuickAddProductModal open={addOpen} onOpenChange={setAddOpen} />
      <PublishRitual payload={ritual} onDismiss={() => setRitual(null)} />
    </div>
  )
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "font-mono text-[11px] uppercase tracking-[0.12em] transition-colors px-1",
        active ? "text-primary" : "text-foreground hover:text-primary/80",
      )}
    >
      {label}
    </button>
  )
}

function CatalogEmpty({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-dashed border-foreground/25 py-14 px-8 text-center">
      <InkWash />
      <div className="relative">
        <EditorsHeadline accentWord={EMPTY.catalog.accentWord} size="lg">
          {EMPTY.catalog.headline}
        </EditorsHeadline>
        <p className="font-display italic text-sm text-muted-foreground mt-3 max-w-md mx-auto leading-relaxed">
          {EMPTY.catalog.sub}
        </p>
        <button
          onClick={onAdd}
          className="mt-6 font-body text-sm font-medium bg-primary text-primary-foreground px-5 py-2.5 rounded-full hover:bg-foreground/90 transition-colors"
        >
          {EMPTY.catalog.ctaLabel}
        </button>
      </div>
    </div>
  )
}

import type { Product } from "@/lib/queries/products"
