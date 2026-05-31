"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useUpdateClosedState } from "@/lib/queries/storefront"
import type { Storefront } from "@/lib/queries/storefront"

interface ClosedStateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storefront: Storefront
}

export function ClosedStateModal({
  open,
  onOpenChange,
  storefront,
}: ClosedStateModalProps) {
  const [headline, setHeadline] = useState(storefront.closedHeadline ?? "")
  const [message, setMessage] = useState(storefront.closedMessage ?? "")
  const [showSocials, setShowSocials] = useState(storefront.closedShowSocials)
  const update = useUpdateClosedState()

  useEffect(() => {
    if (open) {
      setHeadline(storefront.closedHeadline ?? "")
      setMessage(storefront.closedMessage ?? "")
      setShowSocials(storefront.closedShowSocials)
    }
  }, [open, storefront])

  const handleSave = async () => {
    try {
      await update.mutateAsync({
        closedHeadline: headline.trim() || null,
        closedMessage: message.trim() || null,
        closedShowSocials: showSocials,
      })
      toast.success("— Closed-state message saved.")
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-[-0.01em]">
            Closed-state message
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
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
              className="font-display italic text-base mt-1 min-h-[100px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={2000}
              placeholder="A short note for visitors."
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showSocials}
              onChange={(e) => setShowSocials(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm">
              Show my social links on the closed page
            </span>
          </label>
        </div>
        <DialogFooter className="gap-2 sm:gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={update.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={update.isPending}
          >
            {update.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
