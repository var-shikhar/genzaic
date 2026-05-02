"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { z } from "zod"
import { useStorefront, useUpdateStorefront } from "@/lib/queries/storefront"
import {
  imprintCoverPresetSchema,
  imprintTypePairingSchema,
  imprintAccentSchema,
} from "@/lib/validations/storefront"
import { CoverPreview, type CoverPreset, type StoreAccent } from "@/components/brand/CoverPreview"
import { EditorialSection, EditorsHeadline, EyebrowLabel } from "@/components/brand/primitives"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

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
})

type EditorInput = z.infer<typeof editorSchema>

const COVER_PRESETS: Array<{ id: CoverPreset; name: string; desc: string }> = [
  { id: "ink",     name: "Ink",      desc: "Off-black, Iris bloom." },
  { id: "sunlit",  name: "Sunlit",   desc: "Warm sunset gradient." },
  { id: "stamp",   name: "Stamp",    desc: "Postal seal in the corner." },
  { id: "studio",  name: "Studio",   desc: "Architectural grid." },
  { id: "archive", name: "Archive",  desc: "Library card, paper-2." },
  { id: "riso",    name: "Riso",     desc: "Halftone pop." },
]

const ACCENT_SWATCHES: Array<{ id: StoreAccent; name: string; hex: string }> = [
  { id: "iris",     name: "Iris",      hex: "#6E37C7" },
  { id: "sage",     name: "Sage",      hex: "#3F6B4F" },
  { id: "ink_blue", name: "Ink-Blue",  hex: "#1E3A8A" },
  { id: "plum",     name: "Plum",      hex: "#7A1F4A" },
  { id: "ochre",    name: "Ochre",     hex: "#9A6B12" },
  { id: "slate",    name: "Slate",     hex: "#374151" },
]

const TYPE_PAIRINGS = [
  { id: "house" as const, label: "House — Fraunces × Inter Tight" },
]

export function StorefrontEditor() {
  const { data: sf } = useStorefront()
  const update = useUpdateStorefront()

  const form = useForm<EditorInput>({
    resolver: zodResolver(editorSchema),
    defaultValues: {
      imprintName:        sf?.imprintName ?? sf?.storeName ?? "",
      imprintSlug:        sf?.imprintSlug ?? sf?.storeUrl ?? "",
      imprintTagline:     sf?.imprintTagline ?? "",
      imprintEditorsNote: sf?.imprintEditorsNote ?? "",
      imprintCoverPreset: (sf?.imprintCoverPreset as CoverPreset) ?? "ink",
      imprintTypePairing: "house",
      imprintAccent:      (sf?.imprintAccent as StoreAccent) ?? "iris",
    },
  })

  useEffect(() => {
    if (!sf) return
    form.reset({
      imprintName:        sf.imprintName ?? sf.storeName ?? "",
      imprintSlug:        sf.imprintSlug ?? sf.storeUrl ?? "",
      imprintTagline:     sf.imprintTagline ?? "",
      imprintEditorsNote: sf.imprintEditorsNote ?? "",
      imprintCoverPreset: (sf.imprintCoverPreset as CoverPreset) ?? "ink",
      imprintTypePairing: "house",
      imprintAccent:      (sf.imprintAccent as StoreAccent) ?? "iris",
    })
  }, [sf, form])

  const watch = form.watch()

  const onSubmit = async (values: EditorInput) => {
    const fd = new FormData()
    fd.append("imprintCoverPreset", values.imprintCoverPreset)
    fd.append("imprintTypePairing", values.imprintTypePairing)
    fd.append("imprintAccent", values.imprintAccent)
    if (values.imprintName) fd.append("imprintName", values.imprintName)
    if (values.imprintSlug) fd.append("imprintSlug", values.imprintSlug)
    if (values.imprintTagline !== undefined) fd.append("imprintTagline", values.imprintTagline)
    if (values.imprintEditorsNote !== undefined) fd.append("imprintEditorsNote", values.imprintEditorsNote)

    try {
      await update.mutateAsync(fd)
      toast.success("— Store updated.")
    } catch {
      toast.error("— Couldn't save. Trying again should help.")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <header className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 items-end pb-6 border-b border-primary/30">
        <div>
          <EyebrowLabel>Store settings · 4 levers</EyebrowLabel>
          <EditorsHeadline accentWord="Store." size="xl" className="mt-3">
            Your Store.
          </EditorsHeadline>
          <p className="font-display italic text-base text-muted-foreground mt-2">
            Pick a cover, type pairing, accent, and voice. Every combination still feels like GenZaic.
          </p>
        </div>
        <Button type="submit" shape="pill" disabled={update.isPending}>
          {update.isPending ? "Saving..." : "Save store"}
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
        <div>
          <EditorialSection number="01" accentDigit="1" label="The Cover" deck="Pick the face for your store.">
            <Controller
              control={form.control}
              name="imprintCoverPreset"
              render={({ field }) => (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {COVER_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => field.onChange(p.id)}
                      className={cn(
                        "p-4 rounded-md border text-left transition-colors",
                        field.value === p.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-primary/5 hover:border-primary/50",
                      )}
                    >
                      <div className="font-display text-lg font-semibold tracking-[-0.01em]">{p.name}</div>
                      <div
                        className={cn(
                          "font-body text-[11px] mt-1",
                          field.value === p.id ? "text-primary-foreground/80" : "text-muted-foreground",
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

          <EditorialSection number="02" accentDigit="2" label="The Type" deck="Set the typeface pairing for your storefront.">
            <Controller
              control={form.control}
              name="imprintTypePairing"
              render={({ field }) => (
                <div className="grid grid-cols-1 gap-2">
                  {TYPE_PAIRINGS.map((p) => (
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
                      <span className="font-display text-base font-semibold tracking-[-0.01em]">{p.label}</span>
                    </button>
                  ))}
                  <p className="font-display italic text-xs text-muted-foreground mt-1">
                    Press · Studio · Plain pairings ship in v1.5 once font licensing lands.
                  </p>
                </div>
              )}
            />
          </EditorialSection>

          <EditorialSection number="03" accentDigit="3" label="The Accent" deck="One swatch, used sparingly.">
            <Controller
              control={form.control}
              name="imprintAccent"
              render={({ field }) => (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {ACCENT_SWATCHES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => field.onChange(s.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-2 rounded-md border transition-colors",
                        field.value === s.id ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/40",
                      )}
                    >
                      <span className="block w-10 h-10 rounded-full" style={{ background: s.hex }} />
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em]">{s.name}</span>
                    </button>
                  ))}
                </div>
              )}
            />
          </EditorialSection>

          <EditorialSection number="04" accentDigit="4" label="The Voice" deck="Your store name, tagline, and a note for buyers.">
            <div className="space-y-5">
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Store name</Label>
                <Input
                  variant="editorial"
                  className="font-display text-2xl font-medium tracking-[-0.02em] py-2 mt-1 h-auto"
                  {...form.register("imprintName")}
                />
              </div>
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Store URL slug</Label>
                <Input
                  variant="editorial"
                  className="font-mono text-base mt-1"
                  placeholder="e.g. shikhar"
                  {...form.register("imprintSlug")}
                />
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground mt-1">
                  genzaic.in/store/<span className="text-primary">{watch.imprintSlug || "your-slug"}</span>
                </p>
                {form.formState.errors.imprintSlug && (
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-flicker mt-1">
                    — {form.formState.errors.imprintSlug.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Tagline (max 80)</Label>
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
            </div>
          </EditorialSection>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start space-y-4 mt-8 lg:mt-0">
          <EyebrowLabel>
            Live preview · genzaic.in/store/{watch.imprintSlug || "your-slug"}
          </EyebrowLabel>
          <CoverPreview
            storeName={watch.imprintName || "Your store"}
            tagline={watch.imprintTagline ?? ""}
            presetOverride={watch.imprintCoverPreset as CoverPreset}
            accentOverride={watch.imprintAccent as StoreAccent}
          />
          {watch.imprintEditorsNote && (
            <blockquote className="font-display italic text-sm text-muted-foreground border-l-2 border-primary pl-3 leading-relaxed">
              &ldquo;{watch.imprintEditorsNote}&rdquo;
            </blockquote>
          )}
        </aside>
      </div>
    </form>
  )
}
