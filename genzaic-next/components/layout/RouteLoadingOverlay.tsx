"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { GenzaicLoader } from "@/components/ui/genzaic-loader"
import { cn } from "@/lib/utils"

const HOLD_MS = 2000
const FADE_OUT_MS = 200

type Phase = "in" | "out" | "gone"

export function RouteLoadingOverlay() {
  const pathname = usePathname()
  const [phase, setPhase] = useState<Phase>("in")

  // Restart the overlay lifecycle on every pathname change (including mount).
  useEffect(() => {
    setPhase("in")

    const holdTimer = window.setTimeout(() => {
      setPhase("out")
    }, HOLD_MS - FADE_OUT_MS)

    const doneTimer = window.setTimeout(() => {
      setPhase("gone")
    }, HOLD_MS)

    return () => {
      window.clearTimeout(holdTimer)
      window.clearTimeout(doneTimer)
    }
  }, [pathname])

  if (phase === "gone") return null

  return (
    <div
      aria-live="polite"
      role="status"
      className={cn(
        "fixed inset-0 z-[60] grid place-items-center bg-background overflow-hidden",
        phase === "in" && "animate-genzaic-overlay-in",
        phase === "out" && "animate-genzaic-overlay-out",
      )}
    >
      <GenzaicLoader.GridBackdrop />
      <div className="relative z-10">
        <GenzaicLoader />
      </div>
    </div>
  )
}
