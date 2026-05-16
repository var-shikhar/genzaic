"use client"

import { useMemo } from "react"
import { Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { parseShowcaseUrl } from "@/lib/showcase/parse-url"
import type { StorefrontShowcase } from "@/lib/showcase/types"
import { cn } from "@/lib/utils"
import { ShowcaseHelpPopover } from "./ShowcaseHelpPopover"

const DEFAULT_TITLE = "Watch & Follow"
const DEFAULT_SUBTITLE = "Get to know the studio behind the products"

const EMPTY_SHOWCASE: StorefrontShowcase = {
  title: DEFAULT_TITLE,
  subtitle: DEFAULT_SUBTITLE,
  featured: null,
  items: [],
}

interface ShowcaseFieldsProps {
  value: StorefrontShowcase | null
  onChange: (next: StorefrontShowcase | null) => void
}

export function ShowcaseFields({ value, onChange }: ShowcaseFieldsProps) {
  const current = value ?? EMPTY_SHOWCASE

  const setTitle = (title: string) => onChange({ ...current, title })
  const setSubtitle = (subtitle: string) => onChange({ ...current, subtitle })

  const setFeaturedUrl = (url: string) => {
    if (url.trim() === "") {
      onChange({ ...current, featured: null })
      return
    }
    const parsed = parseShowcaseUrl(url)
    if (!parsed) {
      // Keep the raw URL the user typed so the inline ✗ state has something to show.
      onChange({
        ...current,
        featured: {
          url,
          normalizedUrl: "",
          embedUrl: "",
          platform: "youtube",
          kind: "video",
          externalId: "",
          caption: current.featured?.caption,
        },
      })
      return
    }
    onChange({
      ...current,
      featured: {
        url: parsed.normalizedUrl,
        normalizedUrl: parsed.normalizedUrl,
        embedUrl: parsed.embedUrl,
        platform: parsed.platform,
        kind: parsed.kind,
        externalId: parsed.externalId,
        caption: current.featured?.caption,
      },
    })
  }

  const setFeaturedCaption = (caption: string) => {
    if (!current.featured) return
    onChange({
      ...current,
      featured: { ...current.featured, caption: caption || undefined },
    })
  }

  const setItemUrl = (idx: number, url: string) => {
    const next = [...current.items]
    if (url.trim() === "") {
      next.splice(idx, 1)
      onChange({ ...current, items: next })
      return
    }
    const parsed = parseShowcaseUrl(url)
    if (!parsed) {
      next[idx] = {
        url,
        normalizedUrl: "",
        embedUrl: "",
        platform: "youtube",
        kind: "video",
        externalId: "",
        caption: next[idx]?.caption,
      }
    } else {
      next[idx] = {
        url: parsed.normalizedUrl,
        normalizedUrl: parsed.normalizedUrl,
        embedUrl: parsed.embedUrl,
        platform: parsed.platform,
        kind: parsed.kind,
        externalId: parsed.externalId,
        caption: next[idx]?.caption,
      }
    }
    onChange({ ...current, items: next })
  }

  const setItemCaption = (idx: number, caption: string) => {
    const next = [...current.items]
    if (!next[idx]) return
    next[idx] = { ...next[idx], caption: caption || undefined }
    onChange({ ...current, items: next })
  }

  const removeItem = (idx: number) => {
    const next = [...current.items]
    next.splice(idx, 1)
    onChange({ ...current, items: next })
  }

  const addItem = () => {
    if (current.items.length >= 4) return
    onChange({
      ...current,
      items: [
        ...current.items,
        {
          url: "",
          normalizedUrl: "",
          embedUrl: "",
          platform: "youtube",
          kind: "video",
          externalId: "",
        },
      ],
    })
  }

  const featuredStatus = useMemo(
    () => statusFor(current.featured?.url ?? ""),
    [current.featured?.url],
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            Section title (max 60)
          </Label>
          <Input
            variant="editorial"
            className="mt-1 font-display text-lg"
            placeholder={DEFAULT_TITLE}
            maxLength={60}
            value={current.title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            Subtitle (max 140)
          </Label>
          <Input
            variant="editorial"
            className="mt-1 font-display italic"
            placeholder={DEFAULT_SUBTITLE}
            maxLength={140}
            value={current.subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </div>
      </div>

      <FieldGroup label="Featured" required>
        <div className="rounded-md border border-primary/30 bg-primary/[0.03] p-3 space-y-2">
          <UrlRow
            url={current.featured?.url ?? ""}
            status={featuredStatus}
            onChange={setFeaturedUrl}
          />
          {current.featured && (
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                Caption (optional, max 80)
              </Label>
              <Input
                variant="editorial"
                className="mt-1"
                placeholder="One line about the clip"
                maxLength={80}
                value={current.featured.caption ?? ""}
                onChange={(e) => setFeaturedCaption(e.target.value)}
              />
            </div>
          )}
        </div>
      </FieldGroup>

      <FieldGroup label={`More (up to 4 — ${current.items.length}/4)`}>
        {current.items.map((item, idx) => {
          const status = statusFor(item.url)
          return (
            <div
              key={idx}
              className="rounded-md border border-border p-3 space-y-2 mt-3 first:mt-0"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Item {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={`Remove item ${idx + 1}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <UrlRow
                url={item.url}
                status={status}
                onChange={(url) => setItemUrl(idx, url)}
              />
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Caption (optional)
                </Label>
                <Input
                  variant="editorial"
                  className="mt-1"
                  placeholder="One line"
                  maxLength={80}
                  value={item.caption ?? ""}
                  onChange={(e) => setItemCaption(idx, e.target.value)}
                />
              </div>
            </div>
          )
        })}
        {current.items.length < 4 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={addItem}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add another
          </Button>
        )}
      </FieldGroup>
    </div>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────────

type Status =
  | { state: "empty" }
  | { state: "ok"; platform: string; kind: string; externalId: string }
  | { state: "bad" }

function statusFor(url: string): Status {
  if (url.trim() === "") return { state: "empty" }
  const parsed = parseShowcaseUrl(url)
  if (!parsed) return { state: "bad" }
  return {
    state: "ok",
    platform: parsed.platform,
    kind: parsed.kind,
    externalId: parsed.externalId,
  }
}

function FieldGroup({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          {label}
        </span>
        {required && (
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-primary">
            required
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function UrlRow({
  url,
  status,
  onChange,
}: {
  url: string
  status: Status
  onChange: (url: string) => void
}) {
  return (
    <div>
      <div className="flex items-center">
        <Input
          variant="editorial"
          className="mt-0 font-mono text-sm"
          placeholder="Paste a YouTube or Instagram link"
          value={url}
          onChange={(e) => onChange(e.target.value)}
        />
        <ShowcaseHelpPopover />
      </div>
      <StatusLine status={status} />
    </div>
  )
}

function StatusLine({ status }: { status: Status }) {
  if (status.state === "empty") return null
  if (status.state === "ok") {
    return (
      <p
        className={cn(
          "mt-1 font-mono text-[10px] uppercase tracking-[0.12em]",
          "text-emerald-600 dark:text-emerald-400",
        )}
      >
        ✓ {status.platform} · {status.kind} {status.externalId}
      </p>
    )
  }
  return (
    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-flicker">
      ✗ Couldn&apos;t read this URL — paste a link to a specific video, reel, or post
    </p>
  )
}
