"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { GenzaicLoader } from "@/components/ui/genzaic-loader"
import { useTogglePublish } from "@/lib/queries/storefront"
import { getApiErrorMessage } from "@/lib/api-error"

interface PublishToShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The seller's storefront slug. The new tab opens at /store/{slug}. */
  slug: string | null | undefined
}

/**
 * Modal that intercepts "View store" clicks while the storefront is in
 * draft. Explains that visitors can't see the store until it's published,
 * and offers a one-click "Publish & open" action.
 *
 * On success: toasts, closes, opens /store/{slug} in a new tab.
 * On failure: toasts the backend message, leaves the modal open so the
 * seller can retry.
 */
export function PublishToShareDialog({
  open,
  onOpenChange,
  slug,
}: PublishToShareDialogProps) {
  const togglePublish = useTogglePublish()
  const [isPublishing, setIsPublishing] = useState(false)

  const handlePublish = async () => {
    if (!slug) return
    setIsPublishing(true)
    try {
      await togglePublish.mutateAsync()
      toast.success("— Store published. Opening store…")
      onOpenChange(false)
      window.open(`/store/${slug}`, "_blank", "noopener,noreferrer")
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Couldn't publish. Try again."))
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={isPublishing ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-[-0.01em]">
            Your store isn&apos;t{" "}
            <span className="italic text-primary font-semibold">live</span> yet.
          </DialogTitle>
          <DialogDescription className="font-display italic text-base leading-relaxed pt-2">
            Visitors can&apos;t see it until you publish. Publishing flips it
            live at{" "}
            <code className="font-mono text-xs text-primary">
              genzaic.in/store/{slug || "your-slug"}
            </code>
            , instantly.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            shape="pill"
            onClick={() => onOpenChange(false)}
            disabled={isPublishing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            shape="pill"
            onClick={handlePublish}
            disabled={isPublishing || !slug}
            className="gap-2"
          >
            {isPublishing ? (
              <GenzaicLoader.Inline label="Publishing" />
            ) : (
              <>
                <ExternalLink className="h-4 w-4" />
                Publish &amp; open
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
