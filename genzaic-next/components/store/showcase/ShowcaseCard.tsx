"use client"

import Image from "next/image"
import { Instagram, Play, Youtube } from "lucide-react"
import type { ShowcaseItem } from "@/lib/showcase/types"
import { cn } from "@/lib/utils"

interface ShowcaseCardProps {
  item: ShowcaseItem
  onOpen: () => void
}

const KIND_LABEL: Record<ShowcaseItem["kind"], string> = {
  video: "Video",
  short: "Short",
  reel: "Reel",
  post: "Post",
  tv: "IGTV",
}

export function ShowcaseCard({ item, onOpen }: ShowcaseCardProps) {
  const isYouTube = item.platform === "youtube"
  const thumbnail = isYouTube
    ? `https://img.youtube.com/vi/${item.externalId}/hqdefault.jpg`
    : null

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group relative h-[356px] w-[200px] shrink-0 overflow-hidden rounded-lg",
        "bg-gradient-to-br from-indigo-500/20 via-fuchsia-500/20 to-amber-500/20",
        "ring-1 ring-black/10 transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
      )}
      style={{ scrollSnapAlign: "start" }}
      aria-label={`Open ${item.platform} ${KIND_LABEL[item.kind]}`}
    >
      {thumbnail ? (
        <Image
          src={thumbnail}
          alt={item.caption ?? `${item.platform} ${KIND_LABEL[item.kind]}`}
          fill
          sizes="200px"
          className="object-cover transition-transform group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Instagram className="h-12 w-12 text-white/90" aria-hidden />
        </div>
      )}

      {/* Platform badge */}
      <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-sm">
        {isYouTube ? (
          <Youtube className="h-3 w-3" aria-hidden />
        ) : (
          <Instagram className="h-3 w-3" aria-hidden />
        )}
        <span>{KIND_LABEL[item.kind]}</span>
      </div>

      {/* Play overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform group-hover:scale-110">
          <Play className="ml-1 h-6 w-6 fill-black text-black" />
        </span>
      </div>

      {/* Caption */}
      {item.caption && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-8 text-left">
          <p className="line-clamp-2 text-xs font-medium text-white">
            {item.caption}
          </p>
        </div>
      )}
    </button>
  )
}
