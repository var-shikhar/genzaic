"use client"

import { useStorefront } from "@/lib/queries/storefront"
import { Bloom, Grid, Halftone, Pinstripe } from "@/components/brand/motifs"
import { cn } from "@/lib/utils"
import type { CSSProperties } from "react"

export type CoverPreset =
  | "ink"
  | "sunlit"
  | "stamp"
  | "studio"
  | "archive"
  | "riso"
  | "mono"
  | "sage"
  | "linen"
  | "noir"
export type StoreAccent = "iris" | "sage" | "ink_blue" | "plum" | "ochre" | "slate"
// Backwards-compat alias for callers still importing the old name.
export type ImprintAccent = StoreAccent

interface CoverPreviewProps {
  productTitle?: string
  storeName?: string
  /** @deprecated use storeName */
  imprintName?: string
  tagline?: string
  hexCode?: string | null
  presetOverride?: CoverPreset | null
  accentOverride?: StoreAccent | null
  className?: string
}

const accentHex: Record<StoreAccent, string> = {
  iris:     "#6E37C7",
  sage:     "#3F6B4F",
  ink_blue: "#1E3A8A",
  plum:     "#7A1F4A",
  ochre:    "#9A6B12",
  slate:    "#374151",
}

export function CoverPreview(props: CoverPreviewProps) {
  const { data: storefront } = useStorefront()
  const preset = props.presetOverride ?? (storefront?.imprintCoverPreset as CoverPreset) ?? "ink"
  const accent = props.accentOverride ?? (storefront?.imprintAccent as StoreAccent) ?? "iris"
  const storeName =
    props.storeName ??
    props.imprintName ??
    storefront?.imprintName ??
    storefront?.storeName ??
    "Your store"
  const tagline = props.tagline ?? storefront?.imprintTagline ?? storefront?.tagline ?? ""
  const title = props.productTitle ?? storeName
  const hex = props.hexCode

  const styleVars = { ["--accent" as string]: accentHex[accent] } as CSSProperties

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg aspect-[16/9] p-6 sm:p-8 flex flex-col justify-between",
        presetClass[preset],
        props.className,
      )}
      style={styleVars}
    >
      {presetMotif(preset)}
      <div className="relative font-mono text-[10px] uppercase tracking-[0.2em] opacity-65">
        {storeName}{hex ? ` · #${hex}` : ""}
      </div>
      <div className="relative">
        <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl tracking-[-0.04em] leading-[0.95]">
          {title}
        </h2>
        {tagline && <p className="font-display italic mt-3 text-sm md:text-base opacity-80 max-w-md">{tagline}</p>}
      </div>
    </div>
  )
}

const presetClass: Record<CoverPreset, string> = {
  ink:     "bg-foreground text-background",
  sunlit:  "text-[#2A1810]",
  stamp:   "bg-[#0A0F1F] text-white",
  studio:  "bg-background text-foreground border border-foreground",
  archive: "bg-paper-2 text-foreground",
  riso:    "bg-background text-foreground",
  mono:    "bg-stone-50 text-stone-900",
  sage:    "bg-emerald-50 text-emerald-950",
  linen:   "bg-amber-50 text-amber-950",
  noir:    "bg-neutral-950 text-neutral-50",
}

function presetMotif(preset: CoverPreset) {
  switch (preset) {
    case "ink":
      return <Bloom variant="iris" position="tr" animated />
    case "sunlit":
      return <SunlitBackdrop />
    case "stamp":
      // Cobalt — luminous twin radial glows over a navy base. The right-side
      // glow uses #3BA7FF (the theme accent) so the cover reads as "lit from
      // within" rather than flat dark. Sits behind the title.
      return (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 25% 25%, rgba(59,167,255,0.35) 0%, transparent 55%), radial-gradient(ellipse at 80% 75%, rgba(59,167,255,0.18) 0%, transparent 60%)",
          }}
        />
      )
    case "studio":
      return <Grid centerDot />
    case "archive":
      return <Pinstripe direction="horizontal" />
    case "riso":
      return <Halftone variant="signal" />
  }
}

function SunlitBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        background: "linear-gradient(135deg, #FBE9CB 0%, #F4DBA5 60%, #E8A86B 100%)",
      }}
    />
  )
}
