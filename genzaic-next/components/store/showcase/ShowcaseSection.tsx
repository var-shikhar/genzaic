import type { StorefrontShowcase } from "@/lib/showcase/types"
import { cn } from "@/lib/utils"
import { FeaturedEmbed } from "./FeaturedEmbed"
import { ShowcaseCarousel } from "./ShowcaseCarousel"

interface ShowcaseSectionProps {
  showcase: StorefrontShowcase | null
  /**
   * Theme classes resolved by the public store page. Without these the section
   * falls back to `text-foreground` / `text-muted-foreground` (the dashboard
   * defaults), which read wrong on dark/noir storefront themes — the section
   * background is transparent so the parent's themed bg always shows through.
   */
  subTextClassName?: string
}

export function ShowcaseSection({
  showcase,
  subTextClassName,
}: ShowcaseSectionProps) {
  if (!showcase || !showcase.featured) return null

  const subCls = subTextClassName ?? "text-muted-foreground"

  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-10 sm:pb-14">
        <FeaturedEmbed item={showcase.featured} subTextClassName={subCls} />

        {showcase.items.length > 0 && (
          <div className="mt-12">
            <h3
              className={cn(
                "mb-4 text-xs font-mono uppercase tracking-[0.15em]",
                subCls,
              )}
            >
              More from the creator
            </h3>
            <ShowcaseCarousel items={showcase.items} />
          </div>
        )}
      </div>
    </section>
  )
}
