"use client"

import { DeleteDraftDialog } from "@/components/dashboard/storefront/DeleteDraftDialog"
import { DraftFormModal } from "@/components/dashboard/storefront/DraftFormModal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { StorefrontDraft } from "@/lib/db/schema"
import { useDrafts } from "@/lib/queries/storefront"
import { cn } from "@/lib/utils"
import {
  Check,
  ChevronDown,
  Eye,
  Lock,
  Pencil,
  Plus,
  Trash2
} from "lucide-react"
import { useState } from "react"

interface DraftSwitcherProps {
  activeDraftId: string | null
  liveSlug: string | null
  liveDraftId: string | null
  /**
   * Whether the storefront is currently in the `published` state. The Live
   * chip only renders when this is true — otherwise the row that USED to
   * be live no longer represents anything visitors can see, so showing
   * "Live" alongside the DRAFT pill in the header would be a contradiction.
   */
  storeIsPublished: boolean
  onSelect: (id: string) => void
}

export function DraftSwitcher({
  activeDraftId,
  liveSlug,
  liveDraftId,
  storeIsPublished,
  onSelect,
}: DraftSwitcherProps) {
  const { data: drafts = [] } = useDrafts()

  // The form modal toggles between "create new" (draft=null) and
  // "edit existing" (draft=<row>) — same component, two modes.
  const [formMode, setFormMode] = useState<
    | { kind: "closed" }
    | { kind: "create" }
    | { kind: "edit"; draft: StorefrontDraft }
  >({ kind: "closed" })

  // Delete dialog state — separate from the form so the warning copy can
  // be tailored per-row before showing.
  const [pendingDelete, setPendingDelete] = useState<StorefrontDraft | null>(
    null,
  )

  const active = drafts.find((d) => d.id === activeDraftId) ?? null
  const buttonLabel = active
    ? active.name
    : drafts.length > 0
      ? "Pick a version"
      : "No versions yet"
  // True only when (a) the public store is currently published AND (b) the
  // active draft is the one mirrored onto that public row. Both gates have
  // to pass — an unpublished store should never show "Live" anywhere.
  const activeIsLive = storeIsPublished && !!active && active.id === liveDraftId

  // The "next-most-recently-updated other draft" — what the delete dialog
  // shows as the successor when removing the live version.
  const successorFor = (id: string): StorefrontDraft | null => {
    const others = drafts
      .filter((d) => d.id !== id)
      .slice()
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
    return others[0] ?? null
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-2 px-3 h-9 rounded-md border bg-background",
              "font-mono text-[11px] uppercase tracking-[0.12em]",
              "transition-colors max-w-[280px]",
              activeIsLive
                ? "border-emerald-500/40 hover:bg-emerald-500/5"
                : "border-border hover:bg-muted/40",
            )}
            aria-label="Switch version"
          >
            <span className="text-muted-foreground">Editing:</span>
            <span className="truncate text-foreground normal-case tracking-normal font-display text-sm">
              {buttonLabel}
            </span>
            {activeIsLive && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-mono text-[8px] uppercase tracking-[0.14em] shrink-0"
                title="This version is currently live"
              >
                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                Live
              </span>
            )}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[400px]">
          <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            Your versions
          </DropdownMenuLabel>
          {drafts.length === 0 && (
            <p className="px-3 py-2 font-display italic text-sm text-muted-foreground">
              No versions yet — start one below.
            </p>
          )}
          {drafts.map((d) => (
            <DraftRow
              key={d.id}
              draft={d}
              isActive={d.id === activeDraftId}
              isLive={storeIsPublished && d.id === liveDraftId}
              liveSlug={liveSlug}
              onSelect={() => onSelect(d.id)}
              onEdit={() => setFormMode({ kind: "edit", draft: d })}
              onDelete={() => setPendingDelete(d)}
            />
          ))}
          <DropdownMenuSeparator />
          <button
            type="button"
            onClick={() => setFormMode({ kind: "create" })}
            className={cn(
              "w-full px-2 py-1.5 rounded-sm flex items-center gap-2",
              "font-display text-sm hover:bg-muted/60 transition-colors text-left",
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            New version
          </button>
        </DropdownMenuContent>
      </DropdownMenu>

      <DraftFormModal
        open={formMode.kind !== "closed"}
        onOpenChange={(open) => {
          if (!open) setFormMode({ kind: "closed" })
        }}
        draft={formMode.kind === "edit" ? formMode.draft : null}
        onCreated={(id) => onSelect(id)}
      />

      <DeleteDraftDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
        draft={pendingDelete}
        successorName={
          pendingDelete ? (successorFor(pendingDelete.id)?.name ?? null) : null
        }
        isLive={storeIsPublished && pendingDelete?.id === liveDraftId}
        onDeleted={(deletedId) => {
          // If the deleted draft was active, snap to whatever's now first in
          // the list (the parent owns the URL — pass null to clear and let
          // the auto-select effect pick the next).
          if (deletedId === activeDraftId) {
            const remaining = drafts.filter((d) => d.id !== deletedId)
            if (remaining[0]) onSelect(remaining[0].id)
          }
        }}
      />
    </>
  )
}

interface DraftRowProps {
  draft: StorefrontDraft
  isActive: boolean
  isLive: boolean
  liveSlug: string | null
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}

function DraftRow({
  draft,
  isActive,
  isLive,
  liveSlug,
  onSelect,
  onEdit,
  onDelete,
}: DraftRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 px-1 py-1 rounded-sm",
        isActive && "bg-primary/5",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex-1 min-w-0 px-2 py-1 rounded-sm text-left hover:bg-muted/60 transition-colors"
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          {isActive && <Check className="h-3 w-3 text-primary shrink-0" />}
          <span className="font-display text-sm truncate">{draft.name}</span>
          {isLive && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono text-[8px] uppercase tracking-[0.14em]">
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              Live
            </span>
          )}
          {draft.isDefault && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-border bg-muted/40 text-muted-foreground font-mono text-[8px] uppercase tracking-[0.14em]">
              <Lock className="w-2 h-2" />
              Default
            </span>
          )}
        </div>
        {draft.description && (
          <div className="font-display italic text-[11px] text-muted-foreground truncate mt-0.5">
            {draft.description}
          </div>
        )}
        <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground mt-0.5">
          Updated {new Date(draft.updatedAt).toLocaleString()}
        </div>
      </button>
      <div className="flex items-center gap-0.5 shrink-0">
        {liveSlug && (
          <a
            href={`/store/${liveSlug}?draft=${draft.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded hover:bg-muted/60 transition-colors"
            aria-label="Preview"
            title="Preview"
            onClick={(e) => e.stopPropagation()}
          >
            <Eye className="h-3.5 w-3.5" />
          </a>
        )}
        {/* <button
          type="button"
          onClick={async (e) => {
            e.stopPropagation()
            try {
              const enabled = !draft.previewToken
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
          title={draft.previewToken ? "Revoke share link" : "Create share link"}
          className={cn(
            "p-1.5 rounded hover:bg-muted/60 transition-colors",
            draft.previewToken && "text-primary",
          )}
        >
          <Link2 className="h-3.5 w-3.5" />
        </button> */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          aria-label="Edit version details"
          title="Edit details"
          className="p-1.5 rounded hover:bg-muted/60 transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        {!draft.isDefault && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            aria-label="Delete version"
            title="Delete"
            className="p-1.5 rounded hover:bg-flicker/10 text-flicker transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
