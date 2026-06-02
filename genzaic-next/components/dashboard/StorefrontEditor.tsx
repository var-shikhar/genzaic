"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { z } from "zod"
import Image from "next/image"
import { Upload, X } from "lucide-react"
import {
  useStorefront,
  useUpdateStorefront,
  useCheckSlug,
  useDraft,
  useDrafts,
  useCreateDraft,
  useUpdateDraft,
  usePublishDraft,
} from "@/lib/queries/storefront"
import { useProducts } from "@/lib/queries/products"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { GenzaicLoader } from "@/components/ui/genzaic-loader"
import { PublishToShareDialog } from "@/components/dashboard/PublishToShareDialog"
import { HeaderStrip } from "@/components/dashboard/storefront/HeaderStrip"
import { UnpublishDialog } from "@/components/dashboard/storefront/UnpublishDialog"
import { ClosedStateModal } from "@/components/dashboard/storefront/ClosedStateModal"
import { SlugStatusBadge } from "@/components/dashboard/storefront/SlugStatusBadge"
import type { DraftContent } from "@/lib/validations/storefront"
import {
  imprintCoverPresetSchema,
  imprintTypePairingSchema,
  imprintAccentSchema,
} from "@/lib/validations/storefront"
import { ShowcaseFields } from "@/components/dashboard/storefront/ShowcaseFields"
import type { StorefrontShowcase } from "@/lib/showcase/types"
import { parseShowcaseUrl } from "@/lib/showcase/parse-url"
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
  // Permissive regex for back-compat: legacy slugs may contain digits and
  // hyphens from before the rules tightened. The editor's live check (see
  // `SLUG_STRICT_RE` further down) enforces the new strict "lowercase +
  // underscore only" format for any input the seller can actually type.
  imprintSlug: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9][a-z0-9_-]*$/, "Lowercase letters and underscores only")
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
  { id: "stamp", name: "Cobalt", desc: "Deep navy, sky-blue accent." },
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

  // ─── Drafts wiring ─────────────────────────────────────────────────────────
  // The active draft id is in the URL so deep links + reloads keep state.
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeDraftId = searchParams.get("draft")
  const { data: drafts } = useDrafts()
  const { data: activeDraft } = useDraft(activeDraftId)
  const createDraft = useCreateDraft()
  const updateDraft = useUpdateDraft(activeDraftId ?? "")
  const publishDraft = usePublishDraft()

  // Brief overlay shown while the editor swaps which draft is loaded so the
  // seller gets visual confirmation that a switch is happening (form
  // hydration is fast but the user needs a beat of feedback).
  const [isSwitchingDraft, setIsSwitchingDraft] = useState(false)

  const setActiveDraft = (id: string | null) => {
    if (id === activeDraftId) return
    setIsSwitchingDraft(true)
    const params = new URLSearchParams(searchParams.toString())
    if (id) params.set("draft", id)
    else params.delete("draft")
    const qs = params.toString()
    router.replace(qs ? `?${qs}` : "?")
  }

  // Clear the switching overlay once the new draft's content lands in state.
  useEffect(() => {
    if (!isSwitchingDraft) return
    if (!activeDraftId) {
      setIsSwitchingDraft(false)
      return
    }
    if (activeDraft?.id === activeDraftId) {
      // Tiny delay so the overlay actually shows even when the data is
      // already in cache — sub-100ms flashes feel buggier than no overlay.
      const t = setTimeout(() => setIsSwitchingDraft(false), 250)
      return () => clearTimeout(t)
    }
  }, [activeDraftId, activeDraft, isSwitchingDraft])

  // Auto-pick the first draft if the seller lands without one and has drafts.
  // The GET /api/storefront/drafts endpoint guarantees at least one row
  // (auto-provisioned default), so this effect always finds a target.
  useEffect(() => {
    if (!activeDraftId && drafts && drafts.length > 0) {
      setActiveDraft(drafts[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDraftId, drafts])

  const [unpublishOpen, setUnpublishOpen] = useState(false)
  const [closedModalOpen, setClosedModalOpen] = useState(false)

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
  // The "removed" flags track an intent to delete a previously-saved image; they
  // gate display locally and are sent to the API on save so the persisted row +
  // the ImageKit file can be nulled out.
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoRemoved, setLogoRemoved] = useState(false)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverRemoved, setCoverRemoved] = useState(false)
  const blobUrls = useRef<string[]>([])

  // Publish-first modal state — opens when the seller clicks "View store"
  // while the storefront is still in draft.
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)

  // Showcase state lives outside react-hook-form because it's a nested
  // structure that we serialize as JSON in the FormData submit.
  const [showcase, setShowcase] = useState<StorefrontShowcase | null>(
    sf?.showcase ?? null,
  )

  // Snapshot of the showcase as it was when the form last hydrated. Used
  // alongside react-hook-form's isDirty + the staged image flags to decide
  // whether the seller has anything new to save. Reset each time the
  // active draft (or the no-draft live row) hydrates the form.
  const initialShowcaseJsonRef = useRef<string>(
    JSON.stringify(sf?.showcase ?? null),
  )

  // Cleanup blob URLs on unmount.
  useEffect(() => {
    return () => {
      blobUrls.current.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [])

  useEffect(() => {
    if (!sf) return
    // If a draft is active, the draft's content is the source of truth — wait
    // for it to load and hydrate from there. The separate effect below covers
    // the draft hydration.
    if (activeDraftId) return
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
    setShowcase(sf.showcase ?? null)
    initialShowcaseJsonRef.current = JSON.stringify(sf.showcase ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sf, activeDraftId])

  // Hydrate the form from the active draft whenever it changes.
  useEffect(() => {
    if (!activeDraft) return
    const c = activeDraft.content as DraftContent
    // Slug fallback chain: draft → live row's imprintSlug → legacy storeUrl
    // → empty. If the draft itself doesn't carry a slug (legacy drafts, or
    // ones that lost the field through an empty-form save), seeding from
    // the live store keeps the field populated so the seller can see what
    // their public URL will be and the next save persists it back into the
    // draft. Without this, the form looks empty and Save & Publish trips
    // the slug_invalid gate.
    const slugFallback = sf?.imprintSlug ?? sf?.storeUrl ?? ""
    form.reset({
      imprintName: c.imprintName ?? defaultStoreName,
      imprintSlug: c.imprintSlug ?? slugFallback,
      imprintTagline: c.imprintTagline ?? "",
      imprintEditorsNote: c.imprintEditorsNote ?? "",
      imprintCoverPreset: c.imprintCoverPreset as CoverPreset,
      imprintTypePairing:
        c.imprintTypePairing as EditorInput["imprintTypePairing"],
      imprintAccent: c.imprintAccent as StoreAccent,
      primaryColor:
        c.primaryColor && HEX_RE.test(c.primaryColor)
          ? c.primaryColor
          : accentToHex[c.imprintAccent as StoreAccent],
    })
    setShowcase(c.showcase ?? null)
    initialShowcaseJsonRef.current = JSON.stringify(c.showcase ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDraft, sf])

  const watch = form.watch()

  // ─── Live slug check ──────────────────────────────────────────────────────
  // Watch the slug field, debounce, then ask the server if it's free. Local
  // status drives the inline message AND gates the Save button so the seller
  // doesn't hit a 400 at submit time.
  const checkSlug = useCheckSlug()
  const [slugStatus, setSlugStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle")
  // 600ms debounce + a 3-char minimum keeps the API hit count sane while the
  // seller is still typing — the original 400ms + 2-char floor produced a
  // request on almost every keystroke prefix (see dev-server log: roha,
  // rohan-, etc.). TanStack Query caches per-slug for 60s so repeats are
  // free; this just stops issuing checks for transient prefixes.
  const debouncedSlug = useDebouncedValue((watch.imprintSlug ?? "").trim(), 600)
  const persistedSlug = sf?.imprintSlug ?? sf?.storeUrl ?? ""

  // Strict format for NEW slugs: lowercase letters + underscore only. Legacy
  // slugs (with hyphens or digits) live behind `slugLocked` and bypass this
  // entirely — the form field is read-only when locked so this regex never
  // runs against historical data.
  const SLUG_STRICT_RE = /^[a-z][a-z_]*$/

  useEffect(() => {
    if (!debouncedSlug || debouncedSlug === persistedSlug) {
      setSlugStatus("idle")
      return
    }
    if (debouncedSlug.length < 3 || debouncedSlug.length > 64) {
      // Still typing — keep quiet rather than flashing "invalid" while the
      // seller hasn't reached the minimum length yet.
      setSlugStatus(debouncedSlug.length > 64 ? "invalid" : "idle")
      return
    }
    if (!SLUG_STRICT_RE.test(debouncedSlug)) {
      setSlugStatus("invalid")
      return
    }
    let cancelled = false
    setSlugStatus("checking")
    checkSlug(debouncedSlug)
      .then((r) => {
        if (cancelled) return
        setSlugStatus(r.available ? "available" : "taken")
      })
      .catch(() => {
        // Silent — submit-time server check still gates the actual save.
        if (cancelled) return
        setSlugStatus("idle")
      })
    return () => {
      cancelled = true
    }
  }, [debouncedSlug, persistedSlug, checkSlug])

  // Resolved preview color: custom primaryColor wins over swatch enum.
  const resolvedColor =
    watch.primaryColor && HEX_RE.test(watch.primaryColor)
      ? watch.primaryColor
      : accentToHex[(watch.imprintAccent as StoreAccent) ?? "iris"]

  // What to actually show for each image: staged blob > (intent to remove ?
  // nothing : persisted URL).
  const logoDisplayed =
    logoPreview ?? (logoRemoved ? null : (sf?.profileImageUrl ?? null))
  const coverDisplayed =
    coverPreview ?? (coverRemoved ? null : (sf?.coverImageUrl ?? null))

  // Derive the live preview shape from current form state + staged image files.
  const previewStore: PreviewStorefront = useMemo(
    () => ({
      storeName: watch.imprintName || defaultStoreName,
      tagline: watch.imprintTagline ?? "",
      description: watch.imprintEditorsNote ?? sf?.description ?? "",
      profileImageUrl: logoDisplayed,
      coverImageUrl: coverDisplayed,
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
    [watch, sf, logoDisplayed, coverDisplayed, resolvedColor, defaultStoreName],
  )

  const stageImage = (kind: "logo" | "cover", file: File | null) => {
    if (!file) {
      // X clicked. If there's a freshly staged file, just discard it. Otherwise
      // mark the saved image for deletion at save time so the API can drop the
      // ImageKit asset + null out the DB columns.
      if (kind === "logo") {
        if (logoFile) {
          setLogoFile(null)
          setLogoPreview(null)
        } else if (sf?.profileImageUrl) {
          setLogoRemoved(true)
        }
      } else {
        if (coverFile) {
          setCoverFile(null)
          setCoverPreview(null)
        } else if (sf?.coverImageUrl) {
          setCoverRemoved(true)
        }
      }
      return
    }
    // Staging a new file overrides any pending removal — the user clearly
    // wants this picture, not a blank slot.
    const url = URL.createObjectURL(file)
    blobUrls.current.push(url)
    if (kind === "logo") {
      setLogoFile(file)
      setLogoPreview(url)
      setLogoRemoved(false)
    } else {
      setCoverFile(file)
      setCoverPreview(url)
      setCoverRemoved(false)
    }
  }

  // Build the draft content payload from current form values + showcase.
  // Used by both "Save draft" and the save-leg of "Save & publish".
  //
  // If the slug is locked (already set on the live store), we send the
  // canonical live value rather than whatever the readonly input contains
  // — defense in depth against form mutation through devtools etc. New
  // users (no slug yet) still pass through their typed value.
  const collectDraftContent = (values: EditorInput): Partial<DraftContent> => ({
    imprintName: values.imprintName ?? null,
    imprintSlug: slugLocked ? (liveSlug ?? null) : values.imprintSlug || null,
    imprintTagline: values.imprintTagline ?? null,
    imprintEditorsNote: values.imprintEditorsNote ?? null,
    imprintCoverPreset: values.imprintCoverPreset,
    imprintTypePairing: values.imprintTypePairing,
    imprintAccent: values.imprintAccent,
    primaryColor: values.primaryColor ?? null,
    showcase,
    socialInstagram: sf?.socialInstagram ?? null,
    socialTwitter: sf?.socialTwitter ?? null,
    socialYoutube: sf?.socialYoutube ?? null,
    socialWebsite: sf?.socialWebsite ?? null,
  })

  // Save draft: writes the form values into the active draft (or auto-creates
  // one if none is active). Image staging still runs through the legacy
  // FormData submit so ImageKit gets the upload; this keeps the existing image
  // flow working until drafts get their own multipart endpoint.
  const handleSaveDraft = async (values: EditorInput) => {
    // Validate showcase URLs locally so the seller sees a specific error
    // instead of a server-side 400.
    if (showcase) {
      if (showcase.featured && !parseShowcaseUrl(showcase.featured.url)) {
        toast.error("— Featured showcase link couldn't be read.")
        return null
      }
      const badItem = showcase.items
        .filter((it) => it.url.trim() !== "")
        .find((it) => !parseShowcaseUrl(it.url))
      if (badItem) {
        toast.error("— One of the carousel links couldn't be read.")
        return null
      }
    }

    let targetDraftId = activeDraftId
    try {
      const content = collectDraftContent(values)
      if (!targetDraftId) {
        // No active draft — create one from the current edits.
        const created = await createDraft.mutateAsync({
          name: `Untitled draft · ${new Date().toLocaleString()}`,
          content,
        })
        targetDraftId = created.draft.id
        setActiveDraft(targetDraftId)
      } else {
        await updateDraft.mutateAsync({ content })
      }

      // Still route image changes through the legacy live endpoint. Drafts
      // carry refs only — the underlying ImageKit upload has to happen
      // somewhere, and this is the path that already does it.
      if (
        logoFile ||
        coverFile ||
        (logoRemoved && !logoFile) ||
        (coverRemoved && !coverFile)
      ) {
        const fd = new FormData()
        if (logoFile) fd.append("profileImage", logoFile)
        if (coverFile) fd.append("coverImage", coverFile)
        if (logoRemoved && !logoFile) fd.append("removeProfileImage", "true")
        if (coverRemoved && !coverFile) fd.append("removeCoverImage", "true")
        await update.mutateAsync(fd)
        setLogoFile(null)
        setCoverFile(null)
        setLogoPreview(null)
        setCoverPreview(null)
        setLogoRemoved(false)
        setCoverRemoved(false)
      }

      toast.success("— Draft saved.")
      return targetDraftId
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save draft.")
      return null
    }
  }

  // Save & publish: validate, save the draft, then promote it via the
  // publish gate. Pre-flight validation here surfaces empty required
  // fields inline instead of relying on the server's 422 — the seller
  // sees what's missing without a roundtrip.
  const handleSaveAndPublish = async (values: EditorInput) => {
    // Clear any stale manual errors from a previous attempt so old
    // messages don't linger when the seller fills in the missing field
    // and tries again.
    form.clearErrors(["imprintName", "imprintSlug"])

    let hasErrors = false
    const trimmedName = (values.imprintName ?? "").trim()
    if (!trimmedName) {
      form.setError("imprintName", {
        type: "manual",
        message: "Store name is required to publish",
      })
      hasErrors = true
    }
    // Slug is required unless it's already locked (a slug exists on the
    // live store row, which the publish endpoint will use as fallback).
    const trimmedSlug = (values.imprintSlug ?? "").trim()
    if (!slugLocked && !trimmedSlug) {
      form.setError("imprintSlug", {
        type: "manual",
        message: "Store URL is required to publish",
      })
      hasErrors = true
    }
    // Reject if the live slug-availability check is in a bad state — saves
    // the seller a server-side reject for slug_taken.
    if (!slugLocked && trimmedSlug && slugStatus === "taken") {
      form.setError("imprintSlug", {
        type: "manual",
        message: "Pick a different store URL — this one is taken",
      })
      hasErrors = true
    }
    if (hasErrors) {
      toast.error("— Fill in the highlighted fields to publish.")
      return
    }

    const draftId = await handleSaveDraft(values)
    if (!draftId) return
    try {
      await publishDraft.mutateAsync(draftId)
      toast.success("— Store published.")
    } catch (err) {
      // The publish endpoint puts the actionable explanation in `detail`,
      // which the fetcher surfaces as the error message — so just show it.
      toast.error(
        `— ${err instanceof Error ? err.message : "Couldn't publish."}`,
      )
    }
  }

  const onSubmit = async (values: EditorInput) => {
    // Default form submit (Enter key on a field) is treated as Save draft.
    await handleSaveDraft(values)
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
  // The slug is permanent once set — same string across every version and
  // not editable from the storefront UI after the seller has one. New users
  // (no slug yet) can still type one here for their first publish.
  const slugLocked = Boolean(liveSlug)

  // ─── "Has anything actually changed?" ──────────────────────────────────────
  // Combines react-hook-form's dirty flag (text fields, theme pickers, etc.),
  // any staged image edits (new upload OR pending remove), and a JSON-diff
  // of the showcase against the value at last hydration. Lets the header
  // grey out the Save buttons when there's literally nothing to save.
  const hasStagedImages = Boolean(
    logoFile || coverFile || logoRemoved || coverRemoved,
  )
  const showcaseDirty =
    JSON.stringify(showcase) !== initialShowcaseJsonRef.current
  const hasChanges = form.formState.isDirty || hasStagedImages || showcaseDirty

  // Whether Save & publish is actionable. Stays enabled if the seller has
  // edits to ship OR if the public store needs (re)publishing (it isn't
  // currently published, or a different draft is currently live so this
  // one needs to be promoted). Only disables in the "you're editing the
  // exact version that's already live and you haven't touched anything"
  // case — which is the one the user flagged as confusing.
  const activeMatchesLive =
    !!activeDraftId &&
    sf.publishState === "published" &&
    activeDraftId === sf.liveDraftId
  const publishEnabled = hasChanges || !activeMatchesLive

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
        <HeaderStrip
          storefront={sf}
          liveSlug={liveSlug}
          activeDraftId={activeDraftId}
          saveDraftEnabled={hasChanges}
          publishEnabled={publishEnabled}
          onDraftSelect={setActiveDraft}
          isSaving={
            createDraft.isPending || updateDraft.isPending || update.isPending
          }
          isPublishing={publishDraft.isPending}
          onSaveDraft={() => form.handleSubmit(handleSaveDraft)()}
          onSaveAndPublish={() => form.handleSubmit(handleSaveAndPublish)()}
          onViewStore={() => {
            if (!liveSlug) return
            if (sf.publishState !== "published") {
              setPublishDialogOpen(true)
              return
            }
            window.open(`/store/${liveSlug}`, "_blank", "noopener,noreferrer")
          }}
          onUnpublish={() => setUnpublishOpen(true)}
          onEditClosedState={() => setClosedModalOpen(true)}
        />
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
                  aria-invalid={
                    form.formState.errors.imprintName ? true : undefined
                  }
                  {...form.register("imprintName", {
                    onChange: () => {
                      if (
                        form.formState.errors.imprintName?.type === "manual"
                      ) {
                        form.clearErrors("imprintName")
                      }
                    },
                  })}
                />
                {form.formState.errors.imprintName && (
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-flicker mt-1">
                    — {form.formState.errors.imprintName.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Store URL slug
                  {slugLocked && (
                    <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted/60 text-muted-foreground font-mono text-[8px] uppercase tracking-[0.14em]">
                      Locked
                    </span>
                  )}
                </Label>
                <Input
                  variant="editorial"
                  className={cn(
                    "font-mono text-base mt-1",
                    slugLocked && "opacity-70 cursor-not-allowed",
                  )}
                  placeholder="e.g. rohan_gupta"
                  readOnly={slugLocked}
                  aria-readonly={slugLocked || undefined}
                  aria-invalid={
                    form.formState.errors.imprintSlug ? true : undefined
                  }
                  {...form.register("imprintSlug", {
                    onChange: (e) => {
                      // As-you-type sanitization. Forces lowercase, rewrites
                      // common separators (space, hyphen, dot) to underscore
                      // so common patterns like "Rohan Gupta" → "rohan_gupta"
                      // happen automatically, strips anything else outside
                      // [a-z_], then collapses repeated underscores. We only
                      // re-set the value if it changed to avoid an infinite
                      // re-render loop and to preserve caret position when
                      // the input was already valid.
                      if (slugLocked) return
                      const raw = String(e.target.value ?? "")
                      const cleaned = raw
                        .toLowerCase()
                        .replace(/[\s.\-]+/g, "_")
                        .replace(/[^a-z_]/g, "")
                        .replace(/_+/g, "_")
                      if (cleaned !== raw) {
                        form.setValue("imprintSlug", cleaned, {
                          shouldValidate: false,
                          shouldDirty: true,
                        })
                      }
                      if (
                        form.formState.errors.imprintSlug?.type === "manual"
                      ) {
                        form.clearErrors("imprintSlug")
                      }
                    },
                  })}
                />
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground mt-1">
                  genzaic.in/store/
                  <span className="text-primary">
                    {watch.imprintSlug || "your-slug"}
                  </span>
                </p>
                {slugLocked ? (
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground mt-1">
                    — Your store URL is permanent. It can&apos;t be changed once
                    set, and it&apos;s the same across every version.
                  </p>
                ) : (
                  <>
                    {form.formState.errors.imprintSlug && (
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-flicker mt-1">
                        — {form.formState.errors.imprintSlug.message}
                      </p>
                    )}
                    {!form.formState.errors.imprintSlug && (
                      <SlugStatusBadge status={slugStatus} />
                    )}
                  </>
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
              <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-6 sm:gap-4 items-start pt-2">
                <div className="w-32 mx-auto sm:w-auto sm:mx-0">
                  <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                    Logo
                  </Label>
                  <ImageDrop
                    preview={logoDisplayed}
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
                    preview={coverDisplayed}
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

          {/* 05 — Showcase */}
          <EditorialSection
            number="05"
            accentDigit="5"
            label="The Showcase"
            deck="Show one featured clip and up to 4 more posts or reels."
          >
            <ShowcaseFields value={showcase} onChange={setShowcase} />
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

      {/* Switching overlay — appears briefly while a different version's
          content is being hydrated into the editor form. Backdrop is a
          subtle scrim so context (header, layout) remains visible. */}
      {isSwitchingDraft && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
          <GenzaicLoader.Page label="Loading version" />
        </div>
      )}

      <PublishToShareDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        slug={liveSlug}
      />
      <UnpublishDialog
        open={unpublishOpen}
        onOpenChange={setUnpublishOpen}
        storefront={sf}
      />
      <ClosedStateModal
        open={closedModalOpen}
        onOpenChange={setClosedModalOpen}
        storefront={sf}
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
        // Outer wrapper has NO overflow:hidden so the X badge can sit just
        // outside the image corner without being clipped by `rounded-full`.
        <div className={cn("relative", aspect)}>
          <div
            className={cn(
              "relative h-full w-full overflow-hidden border border-foreground/15",
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
          </div>
          <button
            type="button"
            onClick={() => onPick(null)}
            className="absolute -top-2 -right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background shadow-md ring-2 ring-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
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
