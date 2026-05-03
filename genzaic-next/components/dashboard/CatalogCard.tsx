"use client"

import Link from "next/link"
import Image from "next/image"
import { Edit, Trash2, Package } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { HexCode } from "@/components/brand/primitives"
import { formatCurrency } from "@/lib/utils"
import type { Product } from "@/lib/queries/products"

interface CatalogCardProps {
  product: Product & { hexCode: string | null }
  onToggle: (next: boolean) => void
  onDelete: () => void
}

const deliveryLabel: Record<string, string> = {
  download: "Download",
  external_link: "External",
  manual: "By hand",
}

export function CatalogCard({ product, onToggle, onDelete }: CatalogCardProps) {
  const editHref = `/dashboard/products/${product.slug ?? product.id}/edit`
  return (
    <article className="group relative flex flex-col rounded-md border border-foreground/10 overflow-hidden bg-paper hover:border-primary/40 transition-colors">
      <Link href={editHref} className="relative aspect-square bg-paper-2 block">
        {product.coverImageUrl ? (
          <Image
            src={product.coverImageUrl}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 left-2 font-mono text-[10px] uppercase tracking-[0.12em]">
          {product.isActive ? (
            <span className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded-sm">
              — Live
            </span>
          ) : (
            <span className="bg-foreground/70 text-background px-1.5 py-0.5 rounded-sm">
              Draft
            </span>
          )}
        </div>
      </Link>

      <div className="p-3 flex flex-col gap-2">
        <Link href={editHref} className="min-w-0">
          <h3 className="font-display text-base font-semibold tracking-[-0.015em] leading-snug hover:text-primary transition-colors line-clamp-2">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
          {product.hexCode && <HexCode code={product.hexCode} />}
          <span className="font-mono uppercase tracking-[0.1em]">
            {deliveryLabel[product.deliveryType] ?? product.deliveryType}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1.5 border-t border-foreground/10">
          <div className="font-display text-lg font-semibold tracking-[-0.02em] num-tabular">
            {formatCurrency(Number(product.price))}
          </div>
          <div className="flex items-center gap-1">
            <Switch checked={product.isActive} onCheckedChange={onToggle} />
            <Link
              href={editHref}
              className="p-1.5 hover:bg-foreground/5 rounded-md"
              aria-label="Edit"
            >
              <Edit className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={onDelete}
              className="p-1.5 hover:bg-flicker/10 text-flicker rounded-md"
              aria-label="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
