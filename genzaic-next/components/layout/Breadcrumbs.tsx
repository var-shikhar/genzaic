import Link from "next/link"
import { Fragment } from "react"

export interface BreadcrumbEntry {
  label: string
  href?: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbEntry[] }) {
  if (items.length === 0) return null
  if (items.length === 1 && !items[0].href) return null

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <Fragment key={`${item.label}-${index}`}>
              <li>
                {isLast || !item.href ? (
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
              {!isLast && (
                <span aria-hidden className="font-mono text-[10px] text-muted-foreground/50 mx-2">→</span>
              )}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
