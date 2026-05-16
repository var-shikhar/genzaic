"use client"

import { HelpCircle } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function ShowcaseHelpPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Where do I get this link?"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3 text-sm">
          <p className="font-display font-semibold text-base">
            How to copy a link
          </p>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              YouTube
            </p>
            <p className="text-muted-foreground">
              Click <span className="font-medium text-foreground">Share</span>{" "}
              under the video, then{" "}
              <span className="font-medium text-foreground">Copy link</span>.
              Any link works — share, embed, browser, even Shorts. We figure
              out the rest.
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Instagram
            </p>
            <p className="text-muted-foreground">
              Tap <span className="font-medium text-foreground">(⋯)</span> on
              the post or reel, then{" "}
              <span className="font-medium text-foreground">Copy link</span>.
              Works for posts, reels, and IGTV.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
