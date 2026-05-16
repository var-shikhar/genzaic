"use client"

import { useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { ShowcaseItem } from "@/lib/showcase/types"
import { ShowcaseCard } from "./ShowcaseCard"
import { ShowcaseLightbox } from "./ShowcaseLightbox"

interface ShowcaseCarouselProps {
  items: ShowcaseItem[]
}

const CARD_WIDTH_WITH_GAP = 216 // 200px card + 16px gap

export function ShowcaseCarousel({ items }: ShowcaseCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<ShowcaseItem | null>(null)

  if (items.length === 0) return null

  const scrollBy = (dir: "left" | "right") => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({
      left: dir === "left" ? -CARD_WIDTH_WITH_GAP : CARD_WIDTH_WITH_GAP,
      behavior: "smooth",
    })
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scrollBy("left")}
        className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 -translate-x-1/2 items-center justify-center rounded-full bg-background p-2 shadow-md ring-1 ring-black/10 hover:bg-muted md:flex"
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto pb-2 pl-1 pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {items.map((item, idx) => (
          <ShowcaseCard
            key={`${item.platform}-${item.externalId}-${idx}`}
            item={item}
            onOpen={() => setActive(item)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollBy("right")}
        className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-background p-2 shadow-md ring-1 ring-black/10 hover:bg-muted md:flex"
        aria-label="Scroll right"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <ShowcaseLightbox
        item={active}
        onOpenChange={(open) => {
          if (!open) setActive(null)
        }}
      />
    </div>
  )
}
