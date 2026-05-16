"use client"

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ShowcaseItem } from "@/lib/showcase/types"
import { InstagramEmbed } from "./InstagramEmbed"

interface ShowcaseLightboxProps {
  item: ShowcaseItem | null
  onOpenChange: (open: boolean) => void
}

export function ShowcaseLightbox({ item, onOpenChange }: ShowcaseLightboxProps) {
  const open = item !== null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[min(720px,90vw)] overflow-auto border-0 bg-black/90 p-4 sm:rounded-lg">
        {/* Required by Radix for a11y; visually hidden. */}
        <DialogTitle className="sr-only">
          {item?.caption ?? "Showcase preview"}
        </DialogTitle>
        {item?.platform === "youtube" && (
          <div className="relative mx-auto aspect-video w-full max-w-[720px] overflow-hidden rounded-md bg-black">
            <iframe
              src={`${item.embedUrl}&autoplay=1`}
              title={item.caption ?? "Video"}
              className="absolute inset-0 h-full w-full"
              allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        )}
        {item?.platform === "instagram" && (
          <div className="mx-auto flex w-full max-w-[540px] flex-col items-center">
            <InstagramEmbed shortcode={item.externalId} kind={item.kind} />
          </div>
        )}
        {item?.caption && (
          <p className="mx-auto mt-3 max-w-[640px] text-center text-sm italic text-white/80">
            {item.caption}
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
