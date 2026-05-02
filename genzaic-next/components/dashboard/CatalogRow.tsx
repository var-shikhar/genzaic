"use client"

import Link from "next/link"
import Image from "next/image"
import { Edit, Trash2, Package } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Watermark } from "@/components/brand/motifs"
import { HexCode, EyebrowLabel } from "@/components/brand/primitives"
import { formatCurrency } from "@/lib/utils"
import type { Product } from "@/lib/queries/products"

interface CatalogRowProps {
  product: Product & { hexCode: string | null }
  index: number
  onToggle: (next: boolean) => void
  onDelete: () => void
}

const deliveryLabel: Record<string, string> = {
  download: "Download",
  external_link: "External",
  manual: "By hand",
}

export function CatalogRow({ product, index, onToggle, onDelete }: CatalogRowProps) {
  const editHref = `/dashboard/products/${product.slug ?? product.id}/edit`
  return (
    <article className="relative grid grid-cols-[40px_64px_1fr_auto_72px_auto_auto] gap-5 items-center py-5 border-b border-foreground/10 overflow-hidden">
      {product.hexCode && <Watermark value={product.hexCode} position="br" size={140} />}

      <div className="relative">
        <EyebrowLabel>{String(index).padStart(3, "0")}</EyebrowLabel>
      </div>

      <Link href={editHref} className="relative w-16 h-20 rounded overflow-hidden bg-paper-2 flex items-center justify-center">
        {product.coverImageUrl ? (
          <Image src={product.coverImageUrl} alt={product.title} fill className="object-cover" sizes="64px" />
        ) : (
          <Package className="h-6 w-6 text-muted-foreground" />
        )}
      </Link>

      <Link href={editHref} className="relative min-w-0">
        <h3 className="font-display text-xl font-semibold tracking-[-0.02em] leading-tight hover:text-primary transition-colors truncate">
          {product.title}
        </h3>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
          {product.hexCode && <HexCode code={product.hexCode} />}
          <span className="font-mono uppercase tracking-[0.1em]">{deliveryLabel[product.deliveryType] ?? product.deliveryType}</span>
          <span>·</span>
          <span>{product.downloads} sold</span>
        </div>
      </Link>

      <div className="relative font-display text-2xl font-semibold tracking-[-0.02em] num-tabular">
        {formatCurrency(Number(product.price))}
      </div>

      <div className="relative font-mono text-[10px] uppercase tracking-[0.12em] text-right">
        {product.isActive
          ? <span className="text-primary">— Live</span>
          : <span className="text-muted-foreground line-through">Draft</span>}
      </div>

      <Switch checked={product.isActive} onCheckedChange={onToggle} className="relative" />

      <div className="relative flex items-center gap-1">
        <Link href={editHref} className="p-2 hover:bg-foreground/5 rounded-md" aria-label="Edit">
          <Edit className="h-4 w-4" />
        </Link>
        <button onClick={onDelete} className="p-2 hover:bg-flicker/10 text-flicker rounded-md" aria-label="Delete">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  )
}
