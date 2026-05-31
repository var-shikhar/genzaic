"use client"

import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useDeleteDraft } from "@/lib/queries/storefront"
import type { StorefrontDraft } from "@/lib/db/schema"

interface DeleteDraftDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  draft: StorefrontDraft | null
  /** Name of the version that will become live if this delete promotes a successor. */
  successorName: string | null
  /** True when the draft being deleted is the one currently mirrored onto the public store. */
  isLive: boolean
  /** Called once the delete succeeds, so the parent can clear active-draft state. */
  onDeleted?: (deletedId: string) => void
}

export function DeleteDraftDialog({
  open,
  onOpenChange,
  draft,
  successorName,
  isLive,
  onDeleted,
}: DeleteDraftDialogProps) {
  const deleteDraft = useDeleteDraft()

  const handleConfirm = async () => {
    if (!draft) return
    try {
      await deleteDraft.mutateAsync(draft.id)
      onDeleted?.(draft.id)
      toast.success(
        isLive && successorName
          ? `— Deleted. "${successorName}" is now live.`
          : "— Version deleted.",
      )
      onOpenChange(false)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't delete version.",
      )
    }
  }

  if (!draft) return null

  return (
    <Dialog
      open={open}
      onOpenChange={deleteDraft.isPending ? undefined : onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-[-0.01em]">
            Delete{" "}
            <span className="italic text-flicker font-semibold">
              {draft.name}?
            </span>
          </DialogTitle>
          <DialogDescription className="font-display italic text-base leading-relaxed pt-2">
            This is permanent — drafts can&apos;t be restored after delete.
          </DialogDescription>
        </DialogHeader>
        {isLive && (
          <div className="rounded-md border border-flicker/40 bg-flicker/5 p-3 mt-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-flicker">
              Currently live
            </p>
            <p className="font-display text-sm leading-relaxed mt-1">
              {successorName ? (
                <>
                  Deleting this version will promote{" "}
                  <span className="font-semibold">
                    &ldquo;{successorName}&rdquo;
                  </span>{" "}
                  (your most-recently-updated other version) to live in its
                  place.
                </>
              ) : (
                <>
                  This is the only version pointing at your live store. After
                  deletion the public page will keep showing the last
                  published content until you publish another version.
                </>
              )}
            </p>
          </div>
        )}
        <DialogFooter className="gap-2 sm:gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteDraft.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={deleteDraft.isPending}
            className="bg-flicker hover:bg-flicker/90 text-white"
          >
            {deleteDraft.isPending ? "Deleting…" : "Delete version"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
