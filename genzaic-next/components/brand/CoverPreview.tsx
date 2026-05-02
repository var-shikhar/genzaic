"use client"

import { useStorefront } from "@/lib/queries/storefront"
import { Bloom, Grid, Halftone, Pinstripe, PostalRing } from "@/components/brand/motifs"
import { cn } from "@/lib/utils"
import type { CSSProperties } from "react"

export type CoverPreset = "ink" | "sunlit" | "stamp" | "studio" | "archive" | "riso"
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
  stamp:   "bg-background text-foreground border border-foreground",
  studio:  "bg-background text-foreground border border-foreground",
  archive: "bg-paper-2 text-foreground",
  riso:    "bg-background text-foreground",
}

function presetMotif(preset: CoverPreset) {
  switch (preset) {
    case "ink":
      return <Bloom variant="iris" position="tr" animated />
    case "sunlit":
      return <SunlitBackdrop />
    case "stamp":
      return (
        <PostalRing className="absolute top-5 right-5" rotate={-12}>
          Stamp<br />2026
        </PostalRing>
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
