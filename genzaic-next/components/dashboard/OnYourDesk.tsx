"use client"

import Link from "next/link"
import { useProducts } from "@/lib/queries/products"
import { useProfile } from "@/lib/queries/user"
import { MonoLabel } from "@/components/brand/primitives"
import { cn } from "@/lib/utils"

interface QueueItem {
  num: string
  title: React.ReactNode
  meta: string
  href: string
  ctaLabel: string
  accent?: boolean
}

export function OnYourDesk() {
  const { data: products } = useProducts({ page: 1, limit: 50 })
  const { data: profile } = useProfile()

  const items: QueueItem[] = []
  let n = 1

  const drafts = products?.products?.filter((p) => !p.isActive).slice(0, 3) ?? []
  for (const draft of drafts) {
    items.push({
      num: String(n++).padStart(3, "0"),
      title: (
        <>
          {draft.title}{" "}
          <em className="italic text-muted-foreground text-sm font-normal">— still in draft</em>
        </>
      ),
      meta: `${draft.hexCode ? `#${draft.hexCode} · ` : ""}cover not picked yet`,
      href: `/dashboard/products/${draft.slug ?? draft.id}/edit`,
      ctaLabel: "Resume editing",
      accent: true,
    })
  }

  if (profile && profile.kycStatus !== "verified") {
    items.push({
      num: String(n++).padStart(3, "0"),
      title: "KYC pending — payouts paused above ₹10k",
      meta: "Five-minute job. Lift the cap.",
      href: "/dashboard/kyc",
      ctaLabel: "Verify credentials",
      accent: true,
    })
  }

  if (items.length === 0) {
    return (
      <section>
        <h2 className="font-display italic text-lg text-muted-foreground font-medium mb-3">On your desk —</h2>
        <p className="font-display italic text-foreground/70">A clear desk. File something new, or take a breath.</p>
      </section>
    )
  }

  return (
    <section>
      <h2 className="font-display italic text-lg text-muted-foreground font-medium mb-3">On your desk —</h2>
      <ul>
        {items.map((item, i) => (
          <li
            key={i}
            className={cn(
              "grid grid-cols-[40px_1fr_auto] gap-4 py-4 items-center",
              i < items.length - 1 && "border-b border-foreground/10",
            )}
          >
            <MonoLabel size="sm" className="text-muted-foreground">{item.num}</MonoLabel>
            <div>
              <div className="font-display text-lg font-semibold tracking-[-0.02em] leading-tight">
                {item.title}
              </div>
              <div className="font-body text-xs text-muted-foreground mt-1">{item.meta}</div>
            </div>
            <Link
              href={item.href}
              className={cn(
                "font-mono text-[10px] uppercase tracking-[0.12em] px-2.5 py-1.5 rounded-full border transition-colors whitespace-nowrap",
                item.accent
                  ? "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  : "border-foreground/40 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary",
              )}
            >
              {item.ctaLabel}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
