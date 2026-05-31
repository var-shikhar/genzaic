"use client"

import { MoreHorizontal, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PublishStatusBadge } from "@/components/dashboard/PublishStatusBadge"
import { DraftSwitcher } from "@/components/dashboard/storefront/DraftSwitcher"
import { cn } from "@/lib/utils"
import type { Storefront } from "@/lib/queries/storefront"

interface HeaderStripProps {
  storefront: Storefront
  liveSlug: string | null
  isSaving: boolean
  isPublishing: boolean
  activeDraftId: string | null
  /** False when there are no unsaved edits — disables the Save draft button. */
  saveDraftEnabled: boolean
  /**
   * False when nothing would change as a result of publishing (the active
   * draft already matches what's live and nothing has been edited). Lets
   * Save & publish stay enabled when the store needs (re)publishing even
   * if no edits are pending.
   */
  publishEnabled: boolean
  onDraftSelect: (id: string) => void
  onSaveDraft: () => void
  onSaveAndPublish: () => void
  onViewStore: () => void
  onUnpublish: () => void
  onEditClosedState: () => void
}

export function HeaderStrip({
  storefront,
  liveSlug,
  isSaving,
  isPublishing,
  activeDraftId,
  saveDraftEnabled,
  publishEnabled,
  onDraftSelect,
  onSaveDraft,
  onSaveAndPublish,
  onViewStore,
  onUnpublish,
  onEditClosedState,
}: HeaderStripProps) {
  const state = storefront.publishState ?? "never_published"
  // Show the kebab only when there's something useful inside — i.e. once the
  // seller has reached the published/unpublished states, where unpublishing
  // and editing the closed-state message make sense.
  const showKebab = state === "published" || state === "unpublished"

  return (
    <div className="flex flex-wrap items-center sm:justify-end justify-end gap-3">
      <div className="flex items-center gap-1">
        <PublishStatusBadge published={state === "published"} />
        {showKebab && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-1 rounded hover:bg-muted/60 transition-colors"
                aria-label="More publish actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {state === "published" && (
                <DropdownMenuItem onSelect={onUnpublish}>
                  Unpublish store
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={onEditClosedState}>
                Edit closed-state message…
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <DraftSwitcher
        activeDraftId={activeDraftId}
        liveSlug={liveSlug}
        liveDraftId={storefront.liveDraftId ?? null}
        storeIsPublished={state === "published"}
        onSelect={onDraftSelect}
      />

      {liveSlug && (
        <Button
          type="button"
          variant="paper"
          className="gap-2"
          onClick={onViewStore}
        >
          <ExternalLink className="h-4 w-4" />
          View store
        </Button>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={onSaveDraft}
        disabled={isSaving || isPublishing || !saveDraftEnabled}
        title={
          !saveDraftEnabled && !isSaving && !isPublishing
            ? "No changes to save"
            : undefined
        }
        className={cn(
          // Matches the muted "Draft" badge tone so the visual link is obvious.
          "border-border bg-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground",
        )}
      >
        {isSaving ? "Saving…" : "Save draft"}
      </Button>

      <Button
        type="button"
        onClick={onSaveAndPublish}
        disabled={isSaving || isPublishing || !publishEnabled}
        title={
          !publishEnabled && !isSaving && !isPublishing
            ? "Already live — nothing new to publish"
            : undefined
        }
      >
        {isPublishing ? "Publishing…" : "Save & publish"}
      </Button>
    </div>
  )
}
