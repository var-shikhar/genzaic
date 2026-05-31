"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Bloom, Watermark } from "@/components/brand/motifs"
import { EditorsHeadline, EyebrowLabel } from "@/components/brand/primitives"

interface PublishRitualProps {
  payload: {
    productTitle: string
    hexCode: string
    storeSlug?: string | null
    /** "published" = live in the catalog (default, existing behavior).
     *  "filed"    = just created — copy softens to celebrate filing the
     *               draft, not publishing it. */
    mode?: "filed" | "published"
  } | null
  onDismiss: () => void
}

export function PublishRitual({ payload, onDismiss }: PublishRitualProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!payload) return
    const t = setTimeout(onDismiss, 4000)
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onDismiss() }
    window.addEventListener("keydown", onKey)
    // Lock background scroll while the overlay is up.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      clearTimeout(t)
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [payload, onDismiss])

  if (!payload || !mounted) return null

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
  })

  const isFiled = payload.mode === "filed"
  const accentWord = isFiled ? "is filed." : "is live."
  const headline = `${payload.productTitle} ${accentWord}`
  const subline = isFiled
    ? "Add the details next — your draft is in the catalog."
    : "Your readers will see this in the catalog within the hour."
  const chipLabel = isFiled ? "— Continue to the editor" : "— Return to the desk"

  // Portal to <body> so the overlay escapes any ancestor that creates a
  // containing block (transform / filter / will-change), which would
  // otherwise trap `fixed inset-0` and leave the dashboard header visible.
  return createPortal(
    <div
      role="dialog"
      aria-label="Publishing"
      onClick={onDismiss}
      className="fixed inset-0 z-[9999] bg-foreground text-background flex items-center justify-center cursor-pointer overflow-hidden"
      style={{ animation: "ritualFade 240ms ease-out" }}
    >
      <Bloom variant="iris" position="tr" animated />
      <Bloom variant="flicker" position="tr" animated />
      <Watermark value={payload.hexCode} position="bl" size={240} className="text-background/[0.04]" />
      <div className="relative max-w-3xl px-8 text-center">
        <EyebrowLabel className="!text-background/60">
          Filed {today}{payload.storeSlug ? ` · ${payload.storeSlug}` : ""} · #{payload.hexCode}
        </EyebrowLabel>
        <EditorsHeadline accentWord={accentWord} size="hero" signal className="mt-4">
          {headline}
        </EditorsHeadline>
        <p className="font-display italic text-base text-background/70 mt-4">
          {subline}
        </p>
        <span className="inline-block mt-8 font-mono text-[10px] uppercase tracking-[0.18em] border border-background rounded-full px-4 py-2">
          {chipLabel}
        </span>
      </div>
      <style>{`@keyframes ritualFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>,
    document.body,
  )
}
