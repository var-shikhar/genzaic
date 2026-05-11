"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { z } from "zod"
import Image from "next/image"
import { Upload, X, ExternalLink } from "lucide-react"
import { useStorefront, useUpdateStorefront } from "@/lib/queries/storefront"
import { useProducts } from "@/lib/queries/products"
import { GenzaicLoader } from "@/components/ui/genzaic-loader"
import { PublishStatusBadge } from "@/components/dashboard/PublishStatusBadge"
import { PublishToShareDialog } from "@/components/dashboard/PublishToShareDialog"
import {
  imprintCoverPresetSchema,
  imprintTypePairingSchema,
  imprintAccentSchema,
} from "@/lib/validations/storefront"
import {
  StorefrontPreview,
  type PreviewProduct,
  type PreviewStorefront,
} from "@/components/store/StorefrontPreview"
import type { CoverPreset, StoreAccent } from "@/components/brand/CoverPreview"
import { presetToThemeId } from "@/lib/store/theme"
import {
  EditorialSection,
  EditorsHeadline,
  EyebrowLabel,
} from "@/components/brand/primitives"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const HEX_RE = /^#([0-9A-Fa-f]{6})$/

const editorSchema = z.object({
  imprintName: z.string().max(255).optional(),
  imprintSlug: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9][a-z0-9-]*$/, "Lowercase letters, numbers, hyphens only")
    .optional()
    .or(z.literal("")),
  imprintTagline: z.string().max(80).optional(),
  imprintEditorsNote: z.string().max(140).optional(),
  imprintCoverPreset: imprintCoverPresetSchema,
  imprintTypePairing: imprintTypePairingSchema,
  imprintAccent: imprintAccentSchema,
  primaryColor: z
    .string()
    .regex(HEX_RE, "Use a 6-char hex like #6E37C7")
    .optional(),
})

type EditorInput = z.infer<typeof editorSchema>

const COVER_PRESETS: Array<{ id: CoverPreset; name: string; desc: string }> = [
  { id: "ink", name: "Ink", desc: "Off-black, Iris bloom." },
  { id: "sunlit", name: "Sunlit", desc: "Warm sunset gradient." },
  { id: "stamp", name: "Stamp", desc: "Postal seal in the corner." },
  { id: "studio", name: "Studio", desc: "Architectural grid." },
  { id: "archive", name: "Archive", desc: "Library card, paper-2." },
  { id: "riso", name: "Riso", desc: "Halftone pop." },
  { id: "mono", name: "Mono", desc: "Newsprint, soft serif." },
  { id: "sage", name: "Sage", desc: "Calm green, wellness." },
  { id: "linen", name: "Linen", desc: "Warm cream, journal feel." },
  { id: "noir", name: "Noir", desc: "Stark black, sharp edges." },
]

const ACCENT_SWATCHES: Array<{ id: StoreAccent; name: string; hex: string }> = [
  { id: "iris", name: "Iris", hex: "#6E37C7" },
  { id: "sage", name: "Sage", hex: "#3F6B4F" },
  { id: "ink_blue", name: "Ink-Blue", hex: "#1E3A8A" },
  { id: "plum", name: "Plum", hex: "#7A1F4A" },
  { id: "ochre", name: "Ochre", hex: "#9A6B12" },
  { id: "slate", name: "Slate", hex: "#374151" },
]

const TYPE_PAIRINGS: Array<{
  id: "house" | "press" | "studio" | "plain"
  name: string
  desc: string
  cssVar: string
}> = [
  {
    id: "house",
    name: "House",
    desc: "Fraunces × Inter Tight — warm editorial.",
    cssVar: "var(--font-display)",
  },
  {
    id: "press",
    name: "Press",
    desc: "Playfair Display × Inter Tight — newspaper.",
    cssVar: "var(--font-press-display)",
  },
  {
    id: "studio",
    name: "Studio",
    desc: "Space Grotesk × Inter Tight — contemporary.",
    cssVar: "var(--font-studio-display)",
  },
  {
    id: "plain",
    name: "Plain",
    desc: "DM Serif Display × Inter Tight — clean.",
    cssVar: "var(--font-plain-display)",
  },
]

const accentToHex: Record<StoreAccent, string> = {
  iris: "#6E37C7",
  sage: "#3F6B4F",
  ink_blue: "#1E3A8A",
  plum: "#7A1F4A",
  ochre: "#9A6B12",
  slate: "#374151",
}

export function StorefrontEditor() {
  const { data: sf } = useStorefront()
  const { data: session } = useSession()
  const update = useUpdateStorefront()

  const userFirstName = (session?.user?.name ?? "").split(" ")[0]
  const defaultStoreName = userFirstName
    ? `${userFirstName}'s Store`
    : "Your store"

  const { data: productsData } = useProducts({
    page: 1,
    limit: 12,
    status: "active",
  })
  const previewProducts: PreviewProduct[] = useMemo(
    () =>
      (productsData?.products ?? []).slice(0, 6).map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        originalPrice: p.originalPrice ?? null,
        coverImageUrl: p.coverImageUrl ?? null,
      })),
    [productsData],
  )

  const form = useForm<EditorInput>({
    resolver: zodResolver(editorSchema),
    defaultValues: {
      imprintName: sf?.imprintName ?? sf?.storeName ?? defaultStoreName,
      imprintSlug: sf?.imprintSlug ?? sf?.storeUrl ?? "",
      imprintTagline: sf?.imprintTagline ?? "",
      imprintEditorsNote: sf?.imprintEditorsNote ?? "",
      imprintCoverPreset: (sf?.imprintCoverPreset as CoverPreset) ?? "ink",
      imprintTypePairing:
        (sf?.imprintTypePairing as EditorInput["imprintTypePairing"]) ??
        "house",
      imprintAccent: (sf?.imprintAccent as StoreAccent) ?? "iris",
      primaryColor:
        sf?.primaryColor && HEX_RE.test(sf.primaryColor)
          ? sf.primaryColor
          : accentToHex.iris,
    },
  })

  // Logo + cover image local state (Files staged for upload, plus blob previews).
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const blobUrls = useRef<string[]>([])

  // Publish-first modal state — opens when the seller clicks "View store"
  // while the storefront is still in draft.
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)

  // Cleanup blob URLs on unmount.
  useEffect(() => {
    return () => {
      blobUrls.current.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [])

  useEffect(() => {
    if (!sf) return
    form.reset({
      imprintName: sf.imprintName ?? sf.storeName ?? defaultStoreName,
      imprintSlug: sf.imprintSlug ?? sf.storeUrl ?? "",
      imprintTagline: sf.imprintTagline ?? "",
      imprintEditorsNote: sf.imprintEditorsNote ?? "",
      imprintCoverPreset: (sf.imprintCoverPreset as CoverPreset) ?? "ink",
      imprintTypePairing:
        (sf.imprintTypePairing as EditorInput["imprintTypePairing"]) ?? "house",
      imprintAccent: (sf.imprintAccent as StoreAccent) ?? "iris",
      primaryColor:
        sf.primaryColor && HEX_RE.test(sf.primaryColor)
          ? sf.primaryColor
          : accentToHex[(sf.imprintAccent as StoreAccent) ?? "iris"],
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sf])

  const watch = form.watch()

  // Resolved preview color: custom primaryColor wins over swatch enum.
  const resolvedColor =
    watch.primaryColor && HEX_RE.test(watch.primaryColor)
      ? watch.primaryColor
      : accentToHex[(watch.imprintAccent as StoreAccent) ?? "iris"]

  // Derive the live preview shape from current form state + staged image files.
  const previewStore: PreviewStorefront = useMemo(
    () => ({
      storeName: watch.imprintName || defaultStoreName,
      tagline: watch.imprintTagline ?? "",
      description: watch.imprintEditorsNote ?? sf?.description ?? "",
      profileImageUrl: logoPreview ?? sf?.profileImageUrl ?? null,
      coverImageUrl: coverPreview ?? sf?.coverImageUrl ?? null,
      themeId: presetToThemeId(
        (watch.imprintCoverPreset as CoverPreset) ?? "ink",
      ),
      primaryColor: resolvedColor,
      fontFamily: watch.imprintTypePairing ?? "house",
      socialInstagram: sf?.socialInstagram ?? null,
      socialTwitter: sf?.socialTwitter ?? null,
      socialYoutube: sf?.socialYoutube ?? null,
      socialWebsite: sf?.socialWebsite ?? null,
      seller: null,
    }),
    [watch, sf, logoPreview, coverPreview, resolvedColor, defaultStoreName],
  )

  const stageImage = (kind: "logo" | "cover", file: File | null) => {
    if (!file) {
      if (kind === "logo") {
        setLogoFile(null)
        setLogoPreview(null)
      } else {
        setCoverFile(null)
        setCoverPreview(null)
      }
      return
    }
    const url = URL.createObjectURL(file)
    blobUrls.current.push(url)
    if (kind === "logo") {
      setLogoFile(file)
      setLogoPreview(url)
    } else {
      setCoverFile(file)
      setCoverPreview(url)
    }
  }

  const onSubmit = async (values: EditorInput) => {
    const fd = new FormData()
    fd.append("imprintCoverPreset", values.imprintCoverPreset)
    fd.append("imprintTypePairing", values.imprintTypePairing)
    fd.append("imprintAccent", values.imprintAccent)
    if (values.imprintName) fd.append("imprintName", values.imprintName)
    if (values.imprintName) fd.append("storeName", values.imprintName) // mirror to legacy
    if (values.imprintSlug) {
      fd.append("imprintSlug", values.imprintSlug)
      fd.append("storeUrl", values.imprintSlug) // mirror to legacy
    }
    if (values.imprintTagline !== undefined) {
      fd.append("imprintTagline", values.imprintTagline)
      fd.append("tagline", values.imprintTagline) // mirror to legacy
    }
    if (values.imprintEditorsNote !== undefined)
      fd.append("imprintEditorsNote", values.imprintEditorsNote)
    if (values.primaryColor) fd.append("primaryColor", values.primaryColor)
    if (logoFile) fd.append("profileImage", logoFile)
    if (coverFile) fd.append("coverImage", coverFile)

    try {
      await update.mutateAsync(fd)
      toast.success("— Store updated.")
      // Clear staged files now that they've been uploaded.
      setLogoFile(null)
      setCoverFile(null)
      setLogoPreview(null)
      setCoverPreview(null)
    } catch {
      toast.error("— Couldn't save. Trying again should help.")
    }
  }

  // Hold the entire editor behind a full-page loader until real storefront
  // data lands — otherwise the form renders for a beat with default values
  // (the user's first name + "'s Store", default theme, etc.) which the
  // seller momentarily sees as "the wrong store." The early-return must
  // come after every hook call above so React's hook ordering rules hold.
  if (!sf) {
    return <GenzaicLoader.Page label="Curating your store" />
  }

  const liveSlug = sf.imprintSlug ?? sf.storeUrl ?? null

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Compact header strip */}
      <header className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 items-end pb-2 border-b border-primary/30">
        <div>
          <EditorsHeadline accentWord="Store." size="xl" className="mt-3">
            Your Store.
          </EditorsHeadline>
          <p className="font-display italic text-base text-muted-foreground mt-2">
            Edit on the left — see the live preview update on the right.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PublishStatusBadge published={sf.isPublished} />

          {liveSlug && (
            <Button
              type="button"
              variant="paper"
              shape="pill"
              className="gap-2"
              onClick={() => {
                // If the store is still a draft, intercept and show the
                // publish-first modal so the seller doesn't get dumped on a
                // 404 page (or worse, link a tester to one).
                if (!sf.isPublished) {
                  setPublishDialogOpen(true)
                  return
                }
                window.open(
                  `/store/${liveSlug}`,
                  "_blank",
                  "noopener,noreferrer",
                )
              }}
            >
              <ExternalLink className="h-4 w-4" />
              View store
            </Button>
          )}
          <Button type="submit" shape="pill" disabled={update.isPending}>
            {update.isPending ? "Saving…" : "Save store"}
          </Button>
        </div>
      </header>

      {/* Two-pane body: 40 / 60 split. Default grid stretch lets the right
          cell match the left's height — that's what gives the inner sticky
          element scrollable space within its containing block. */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6 mt-8">
        {/* Left pane — controls */}
        <div className="min-w-0">
          {/* 01 — Voice */}
          <EditorialSection
            number="01"
            accentDigit="1"
            label="The Voice"
            deck="Your store name, tagline, and a note for buyers."
          >
            <div className="space-y-5">
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Store name
                </Label>
                <Input
                  variant="editorial"
                  className="font-display text-2xl font-medium tracking-[-0.02em] py-2 mt-1 h-auto"
                  placeholder={defaultStoreName}
                  {...form.register("imprintName")}
                />
              </div>
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Store URL slug
                </Label>
                <Input
                  variant="editorial"
                  className="font-mono text-base mt-1"
                  placeholder="e.g. shikhar"
                  {...form.register("imprintSlug")}
                />
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground mt-1">
                  genzaic.in/store/
                  <span className="text-primary">
                    {watch.imprintSlug || "your-slug"}
                  </span>
                </p>
                {form.formState.errors.imprintSlug && (
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-flicker mt-1">
                    — {form.formState.errors.imprintSlug.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Tagline (max 80)
                </Label>
                <Input
                  variant="editorial"
                  className="font-display text-lg italic mt-1"
                  placeholder="One line that captures the store"
                  {...form.register("imprintTagline")}
                  maxLength={80}
                />
              </div>
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Note to buyers (max 140) — appears on order emails
                </Label>
                <Textarea
                  className="font-display italic text-base mt-1 min-h-[100px]"
                  placeholder="A note your buyers will see on every purchase email."
                  {...form.register("imprintEditorsNote")}
                  maxLength={140}
                />
              </div>

              {/* Logo */}
              <div className="grid grid-cols-[120px_1fr] gap-4 items-start pt-2">
                <div>
                  <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                    Logo
                  </Label>
                  <ImageDrop
                    preview={logoPreview ?? sf?.profileImageUrl ?? null}
                    onPick={(f) => stageImage("logo", f)}
                    aspect="aspect-square"
                    rounded="rounded-full"
                    label="Upload logo"
                  />
                </div>
                <div>
                  <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                    Cover image
                  </Label>
                  <ImageDrop
                    preview={coverPreview ?? sf?.coverImageUrl ?? null}
                    onPick={(f) => stageImage("cover", f)}
                    aspect="aspect-[16/6]"
                    rounded="rounded-md"
                    label="Upload cover"
                  />
                </div>
              </div>
            </div>
          </EditorialSection>

          {/* 02 — Cover preset */}
          <EditorialSection
            number="02"
            accentDigit="2"
            label="The Cover"
            deck="Pick the face for your store."
          >
            <Controller
              control={form.control}
              name="imprintCoverPreset"
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2.5">
                  {COVER_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => field.onChange(p.id)}
                      className={cn(
                        "p-3 rounded-md border text-left transition-colors",
                        field.value === p.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-primary/5 hover:border-primary/50",
                      )}
                    >
                      <div className="font-display text-base font-semibold tracking-[-0.01em]">
                        {p.name}
                      </div>
                      <div
                        className={cn(
                          "font-body text-[11px] mt-0.5 leading-snug",
                          field.value === p.id
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground",
                        )}
                      >
                        {p.desc}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            />
          </EditorialSection>

          {/* 03 — Type pairing */}
          <EditorialSection
            number="03"
            accentDigit="3"
            label="The Type"
            deck="Pick a typeface pairing for your storefront."
          >
            <Controller
              control={form.control}
              name="imprintTypePairing"
              render={({ field }) => (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {TYPE_PAIRINGS.map((p) => {
                    const on = field.value === p.id
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => field.onChange(p.id)}
                        className={cn(
                          "p-3 rounded-md border text-left transition-colors",
                          on
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:bg-primary/5 hover:border-primary/50",
                        )}
                      >
                        <div
                          className="text-2xl font-semibold tracking-[-0.02em] leading-none"
                          style={{ fontFamily: `${p.cssVar}, Georgia, serif` }}
                        >
                          {p.name}
                        </div>
                        <div
                          className={cn(
                            "font-body text-[11px] mt-1.5 leading-snug",
                            on
                              ? "text-primary-foreground/80"
                              : "text-muted-foreground",
                          )}
                        >
                          {p.desc}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            />
          </EditorialSection>

          {/* 04 — Accent + custom color */}
          <EditorialSection
            number="04"
            accentDigit="4"
            label="The Accent"
            deck="Pick a swatch — or dial in your own."
          >
            <Controller
              control={form.control}
              name="imprintAccent"
              render={({ field }) => (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                    {ACCENT_SWATCHES.map((s) => {
                      const isCurrent =
                        field.value === s.id &&
                        (!watch.primaryColor ||
                          watch.primaryColor.toLowerCase() ===
                            s.hex.toLowerCase())
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            field.onChange(s.id)
                            form.setValue("primaryColor", s.hex, {
                              shouldDirty: true,
                            })
                          }}
                          className={cn(
                            "flex flex-col items-center gap-1.5 p-2 rounded-md border transition-colors",
                            isCurrent
                              ? "border-primary ring-2 ring-primary/30"
                              : "border-border hover:border-primary/40",
                          )}
                          aria-label={s.name}
                        >
                          <span
                            className="block w-9 h-9 rounded-full"
                            style={{ background: s.hex }}
                          />
                          <span className="font-mono text-[9px] uppercase tracking-[0.12em]">
                            {s.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Custom color picker */}
                  <div className="grid grid-cols-[auto_1fr_auto] gap-3 items-center mt-4 p-3 rounded-md border border-border">
                    <Controller
                      control={form.control}
                      name="primaryColor"
                      render={({ field: colorField }) => (
                        <>
                          <input
                            type="color"
                            value={
                              colorField.value && HEX_RE.test(colorField.value)
                                ? colorField.value
                                : "#6E37C7"
                            }
                            onChange={(e) =>
                              colorField.onChange(e.target.value.toUpperCase())
                            }
                            className="w-12 h-10 rounded border border-border bg-transparent cursor-pointer p-0"
                            aria-label="Custom accent color"
                          />
                          <div>
                            <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                              Custom color
                            </Label>
                            <Input
                              variant="editorial"
                              className="font-mono text-sm mt-0.5 uppercase"
                              placeholder="#6E37C7"
                              value={colorField.value ?? ""}
                              onChange={(e) =>
                                colorField.onChange(
                                  e.target.value.toUpperCase(),
                                )
                              }
                              maxLength={7}
                            />
                          </div>
                          <span
                            className="w-10 h-10 rounded-full border border-border shrink-0"
                            style={{
                              background:
                                colorField.value &&
                                HEX_RE.test(colorField.value)
                                  ? colorField.value
                                  : "transparent",
                            }}
                            aria-hidden
                          />
                        </>
                      )}
                    />
                  </div>
                  {form.formState.errors.primaryColor && (
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-flicker mt-1">
                      — {form.formState.errors.primaryColor.message}
                    </p>
                  )}
                </>
              )}
            />
          </EditorialSection>
        </div>

        {/*
          Right pane — live preview. We pin the <aside> ITSELF with sticky:
          - `lg:self-start` opts out of grid stretching so the aside is only
            as tall as its content (gives sticky room to slide within the
            taller grid row driven by the left form).
          - `lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto` caps the pinned
            block to the viewport so a tall preview can scroll internally
            instead of overflowing the screen.
          - `lg:top-[5rem]` clears the dashboard header (h-16 = 4rem) + gutter.
        */}
        <aside className="min-w-0 lg:sticky lg:top-[5rem] lg:self-start">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <EyebrowLabel>
                Live preview · genzaic.in/store/
                {watch.imprintSlug || "your-slug"}
              </EyebrowLabel>
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
                Updates as you type
              </span>
            </div>

            <div className="rounded-lg border border-border overflow-hidden bg-background shadow-hairline">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/40">
                <span className="w-2.5 h-2.5 rounded-full bg-flicker/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                <span className="ml-2 flex-1 font-mono text-[10px] tracking-[0.1em] text-muted-foreground truncate">
                  genzaic.in/store/{watch.imprintSlug || "your-slug"}
                </span>
              </div>

              {/* No inner scroll — the sticky <aside> handles the cap. */}
              <StorefrontPreview
                storefront={previewStore}
                products={previewProducts}
                hideBuyActions
              />
            </div>

            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Showing up to 6 of your live products. Save to publish changes.
            </p>
          </div>
        </aside>
      </div>

      <PublishToShareDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        slug={liveSlug}
      />
    </form>
  )
}

// ─── ImageDrop helper ────────────────────────────────────────────────────────

interface ImageDropProps {
  preview: string | null
  onPick: (file: File | null) => void
  aspect: string
  rounded: string
  label: string
}

function ImageDrop({
  preview,
  onPick,
  aspect,
  rounded,
  label,
}: ImageDropProps) {
  return (
    <div className="mt-1.5">
      {preview ? (
        <div
          className={cn(
            "relative overflow-hidden border border-foreground/15",
            aspect,
            rounded,
          )}
        >
          <Image
            src={preview}
            alt=""
            fill
            sizes="240px"
            className="object-cover"
          />
          <button
            type="button"
            onClick={() => onPick(null)}
            className="absolute top-1 right-1 p-1 bg-foreground/70 rounded-full hover:bg-foreground"
            aria-label="Remove"
          >
            <X className="h-3 w-3 text-background" />
          </button>
        </div>
      ) : (
        <label
          className={cn(
            "flex flex-col items-center justify-center border-2 border-dashed border-border cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors",
            aspect,
            rounded,
          )}
        >
          <Upload className="w-5 h-5 mb-1 text-muted-foreground" />
          <span className="font-display italic text-[11px] text-muted-foreground text-center px-2">
            {label}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              onPick(file)
              e.target.value = ""
            }}
          />
        </label>
      )}
    </div>
  )
}
