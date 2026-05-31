"use client"

import { useState } from "react"
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
  useUnpublish,
  useUpdateClosedState,
} from "@/lib/queries/storefront"
import type { Storefront } from "@/lib/queries/storefront"

interface UnpublishDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storefront: Storefront
}

export function UnpublishDialog({
  open,
  onOpenChange,
  storefront,
}: UnpublishDialogProps) {
  const unpublish = useUnpublish()
  const updateClosed = useUpdateClosedState()
  const hasClosedConfig = Boolean(
    storefront.closedHeadline || storefront.closedMessage,
  )
  const [headline, setHeadline] = useState("")
  const [message, setMessage] = useState("")

  const handleConfirm = async () => {
    try {
      // If the seller hasn't configured a closed-state message yet, take the
      // inline values along — saves them a round-trip through the modal.
      if (!hasClosedConfig && (headline.trim() || message.trim())) {
        await updateClosed.mutateAsync({
          closedHeadline: headline.trim() || null,
          closedMessage: message.trim() || null,
        })
      }
      await unpublish.mutateAsync()
      toast.success("— Store unpublished.")
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't unpublish.")
    }
  }

  const pending = unpublish.isPending || updateClosed.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={pending ? undefined : onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-[-0.01em]">
            Take store{" "}
            <span className="italic text-flicker font-semibold">offline?</span>
          </DialogTitle>
          <DialogDescription className="font-display italic text-base leading-relaxed pt-2">
            Visitors will see your closed-state page instead of the storefront.
            You can republish at any time.
          </DialogDescription>
        </DialogHeader>
        {!hasClosedConfig && (
          <div className="space-y-3 pt-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              Optional — set a message visitors will see
            </p>
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                Headline
              </Label>
              <Input
                variant="editorial"
                className="font-display text-lg mt-1"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                maxLength={120}
                placeholder="We'll be right back."
              />
            </div>
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                Message
              </Label>
              <Textarea
                className="font-display italic text-base mt-1"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={2000}
                placeholder="A short note for visitors."
              />
            </div>
          </div>
        )}
        <DialogFooter className="gap-2 sm:gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending ? "Unpublishing…" : "Unpublish store"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
