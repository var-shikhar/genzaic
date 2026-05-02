"use client"

import { useEffect } from "react"
import { Bloom, Watermark } from "@/components/brand/motifs"
import { EditorsHeadline, EyebrowLabel } from "@/components/brand/primitives"

interface PublishRitualProps {
  payload: { productTitle: string; hexCode: string; storeSlug?: string | null } | null
  onDismiss: () => void
}

export function PublishRitual({ payload, onDismiss }: PublishRitualProps) {
  useEffect(() => {
    if (!payload) return
    const t = setTimeout(onDismiss, 4000)
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onDismiss() }
    window.addEventListener("keydown", onKey)
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey) }
  }, [payload, onDismiss])

  if (!payload) return null

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
  })

  return (
    <div
      role="dialog"
      aria-label="Publishing"
      onClick={onDismiss}
      className="fixed inset-0 z-[200] bg-foreground text-background flex items-center justify-center cursor-pointer overflow-hidden"
      style={{ animation: "ritualFade 240ms ease-out" }}
    >
      <Bloom variant="iris" position="tr" animated />
      <Bloom variant="flicker" position="tr" animated />
      <Watermark value={payload.hexCode} position="bl" size={240} className="text-background/[0.04]" />
      <div className="relative max-w-3xl px-8 text-center">
        <EyebrowLabel className="!text-background/60">
          Filed {today}{payload.storeSlug ? ` · ${payload.storeSlug}` : ""} · #{payload.hexCode}
        </EyebrowLabel>
        <EditorsHeadline accentWord="is live." size="hero" signal className="mt-4">
          {`${payload.productTitle} is live.`}
        </EditorsHeadline>
        <p className="font-display italic text-base text-background/70 mt-4">
          Your readers will see this in the catalog within the hour.
        </p>
        <span className="inline-block mt-8 font-mono text-[10px] uppercase tracking-[0.18em] border border-background rounded-full px-4 py-2">
          — Return to the desk
        </span>
      </div>
      <style>{`@keyframes ritualFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}
