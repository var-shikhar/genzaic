"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Plus, Eye, Link2, Trash2, Check } from "lucide-react"
import {
  useDrafts,
  useDeleteDraft,
  useCreateDraft,
  usePreviewToken,
} from "@/lib/queries/storefront"
import { Button } from "@/components/ui/button"
import {
  EditorialSection,
  EyebrowLabel,
} from "@/components/brand/primitives"
import { cn } from "@/lib/utils"

interface DraftsPanelProps {
  activeDraftId: string | null
  liveSlug: string | null
  onSelect: (id: string) => void
}

export function DraftsPanel({
  activeDraftId,
  liveSlug,
  onSelect,
}: DraftsPanelProps) {
  const { data: drafts = [] } = useDrafts()
  const deleteDraft = useDeleteDraft()
  const createDraft = useCreateDraft()
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    setCreating(true)
    try {
      const name = window.prompt("Name this draft", "Untitled draft")
      if (!name) {
        setCreating(false)
        return
      }
      const r = await createDraft.mutateAsync({ name, seedFromLive: true })
      onSelect(r.draft.id)
      toast.success("— Draft created.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't create draft.")
    } finally {
      setCreating(false)
    }
  }

  return (
    <EditorialSection
      number="00"
      accentDigit="0"
      label="Your drafts"
      deck="One canvas per draft. Pick one to edit; publish promotes it live."
    >
      <ul className="space-y-2">
        {drafts.length === 0 && (
          <li className="font-display italic text-sm text-muted-foreground">
            No drafts yet. Start one with the button below.
          </li>
        )}
        {drafts.map((d) => {
          const active = d.id === activeDraftId
          return (
            <li
              key={d.id}
              className={cn(
                "flex items-center justify-between gap-3 p-3 rounded-md border transition-colors",
                active
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40",
              )}
            >
              <button
                type="button"
                onClick={() => onSelect(d.id)}
                className="flex-1 text-left min-w-0"
              >
                <div className="flex items-center gap-2">
                  {active && (
                    <Check className="h-3 w-3 text-primary shrink-0" />
                  )}
                  <span className="font-display text-base truncate">
                    {d.name}
                  </span>
                </div>
                <EyebrowLabel>
                  Updated {new Date(d.updatedAt).toLocaleString()}
                </EyebrowLabel>
              </button>
              <DraftRowActions
                draftId={d.id}
                liveSlug={liveSlug}
                previewToken={d.previewToken}
              />
              <button
                type="button"
                onClick={async () => {
                  if (!window.confirm(`Delete "${d.name}"?`)) return
                  try {
                    await deleteDraft.mutateAsync(d.id)
                    toast.success("— Draft deleted.")
                  } catch (err) {
                    toast.error(
                      err instanceof Error
                        ? err.message
                        : "Couldn't delete draft.",
                    )
                  }
                }}
                aria-label="Delete draft"
                className="p-1.5 rounded hover:bg-flicker/10 text-flicker transition-colors shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          )
        })}
      </ul>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleCreate}
        disabled={creating}
        className="mt-4 gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" />
        {creating ? "Creating…" : "New draft (copy current live)"}
      </Button>
    </EditorialSection>
  )
}

interface DraftRowActionsProps {
  draftId: string
  liveSlug: string | null
  previewToken: string | null
}

function DraftRowActions({
  draftId,
  liveSlug,
  previewToken,
}: DraftRowActionsProps) {
  const togglePreview = usePreviewToken(draftId)

  return (
    <div className="flex items-center gap-1 shrink-0">
      {liveSlug && (
        <a
          href={`/store/${liveSlug}?draft=${draftId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded hover:bg-muted/60 transition-colors"
          aria-label="Preview (owner only)"
          title="Preview"
        >
          <Eye className="h-3.5 w-3.5" />
        </a>
      )}
      <button
        type="button"
        onClick={async () => {
          try {
            const enabled = !previewToken
            const r = await togglePreview.mutateAsync(enabled)
            if (r.previewToken && liveSlug) {
              const url = `${window.location.origin}/store/${liveSlug}/preview/${r.previewToken}`
              await navigator.clipboard.writeText(url)
              toast.success("— Share link copied.")
            } else {
              toast.success("— Share link revoked.")
            }
          } catch (err) {
            toast.error(
              err instanceof Error
                ? err.message
                : "Couldn't toggle share link.",
            )
          }
        }}
        aria-label="Toggle share link"
        title={previewToken ? "Revoke share link" : "Create share link"}
        className={cn(
          "p-1.5 rounded hover:bg-muted/60 transition-colors",
          previewToken && "text-primary",
        )}
      >
        <Link2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
