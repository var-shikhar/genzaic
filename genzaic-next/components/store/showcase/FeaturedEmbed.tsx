"use client"

import type { ShowcaseItem } from "@/lib/showcase/types"
import { cn } from "@/lib/utils"
import { InstagramEmbed } from "./InstagramEmbed"

interface FeaturedEmbedProps {
  item: ShowcaseItem
  subTextClassName?: string
}

export function FeaturedEmbed({ item, subTextClassName }: FeaturedEmbedProps) {
  const subCls = subTextClassName ?? "text-muted-foreground"

  if (item.platform === "youtube") {
    return (
      <div className="mx-auto w-full max-w-[720px]">
        <div className="relative aspect-video overflow-hidden rounded-md bg-black shadow-md">
          <iframe
            src={item.embedUrl}
            title={item.caption ?? "Featured video"}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        {item.caption && (
          <p className={cn("mt-3 text-center text-sm italic", subCls)}>
            {item.caption}
          </p>
        )}
      </div>
    )
  }

  // Instagram — let the blockquote take its natural height, centered.
  return (
    <div className="mx-auto flex w-full max-w-[540px] flex-col items-center">
      <InstagramEmbed shortcode={item.externalId} kind={item.kind} />
      {item.caption && (
        <p className={cn("mt-3 text-center text-sm italic", subCls)}>
          {item.caption}
        </p>
      )}
    </div>
  )
}
