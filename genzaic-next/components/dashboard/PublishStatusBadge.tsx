import { cn } from "@/lib/utils"

interface PublishStatusBadgeProps {
  published: boolean
  className?: string
}

/**
 * Small read-only pill that indicates whether the seller's storefront is
 * live (published) or in draft. Sits in the dashboard editor header.
 *
 * Two states:
 *  - Published — emerald solid dot + emerald-tinted pill.
 *  - Draft     — outlined dot + neutral pill.
 *
 * Uppercase mono lettering matches the editorial OS aesthetic used
 * throughout the dashboard (EyebrowLabel, etc).
 */
export function PublishStatusBadge({
  published,
  className,
}: PublishStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        "font-mono text-[10px] uppercase tracking-[0.14em]",
        published
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "border-border bg-transparent text-muted-foreground",
        className,
      )}
      aria-label={published ? "Store is published" : "Store is in draft"}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-block w-1.5 h-1.5 rounded-full",
          published
            ? "bg-emerald-500"
            : "bg-transparent border border-muted-foreground/60",
        )}
      />
      {published ? "Published" : "Draft"}
    </span>
  )
}
