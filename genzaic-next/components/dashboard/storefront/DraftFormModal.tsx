"use client"

import { useEffect, useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  useCreateDraft,
  useUpdateDraft,
} from "@/lib/queries/storefront"
import type { StorefrontDraft } from "@/lib/db/schema"

interface DraftFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /**
   * - `null`  → create mode. Submits a brand-new draft seeded from live.
   * - draft → edit mode. PATCHes name + description on the existing row.
   */
  draft: StorefrontDraft | null
  onCreated?: (id: string) => void
}

/**
 * Unified create-or-edit modal for a draft's metadata (name + description).
 * Replaces the legacy `window.prompt` and lets sellers also edit the
 * details of an existing version after the fact.
 */
export function DraftFormModal({
  open,
  onOpenChange,
  draft,
  onCreated,
}: DraftFormModalProps) {
  const isEdit = draft !== null
  const [name, setName] = useState(draft?.name ?? "")
  const [description, setDescription] = useState(draft?.description ?? "")
  const createDraft = useCreateDraft()
  // The edit hook is keyed by id — when in create mode we still need a
  // stable value, so fall back to an empty string (the mutation is only
  // called in edit mode).
  const updateDraft = useUpdateDraft(draft?.id ?? "")

  // Re-seed the form whenever the modal re-opens for a different draft.
  useEffect(() => {
    if (open) {
      setName(draft?.name ?? "")
      setDescription(draft?.description ?? "")
    }
  }, [open, draft])

  const handleSubmit = () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error("— Version name is required.")
      return
    }
    if (isEdit && draft) {
      // Optimistic — the mutation hook patches the cache in onMutate before
      // the request leaves, so the dropdown row updates immediately. The
      // modal closes without awaiting the network round-trip; on error the
      // hook rolls the cache back and we show a toast.
      updateDraft.mutate(
        {
          name: trimmedName,
          description: description.trim() || null,
        },
        {
          onError: (err) =>
            toast.error(
              err instanceof Error ? err.message : "Couldn't save version.",
            ),
        },
      )
      onOpenChange(false)
      return
    }
    // Create still awaits the server — the new draft needs the server-
    // generated id before the editor can switch to it.
    createDraft.mutate(
      {
        name: trimmedName,
        description: description.trim() || null,
        seedFromLive: true,
      },
      {
        onSuccess: (r) => {
          toast.success("— Version created.")
          onCreated?.(r.draft.id)
          onOpenChange(false)
        },
        onError: (err) =>
          toast.error(
            err instanceof Error ? err.message : "Couldn't create version.",
          ),
      },
    )
  }

  // Only the create flow blocks the button — edit is optimistic and the
  // modal is already closing while the request is in flight.
  const pending = createDraft.isPending

  return (
    <Dialog open={open} onOpenChange={pending ? undefined : onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-[-0.01em]">
            {isEdit ? "Edit version" : "New version"}
          </DialogTitle>
          <DialogDescription className="font-display italic text-base pt-2">
            {isEdit
              ? "Update the name or notes for this version."
              : "Start a new version from your current live store. You'll edit it on the canvas after."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              Version name
            </Label>
            <Input
              variant="editorial"
              className="font-display text-lg mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="e.g. Holiday refresh"
              autoFocus
            />
          </div>
          <div>
            <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              Notes (optional)
            </Label>
            <Textarea
              className="font-display italic text-base mt-1 min-h-[90px]"
              value={description ?? ""}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              placeholder="What's changing in this version?"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={pending}>
            {pending && !isEdit
              ? "Creating…"
              : isEdit
                ? "Save changes"
                : "Create version"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
