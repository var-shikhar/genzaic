"use client"

import { useState } from "react"
import { Mail, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { getApiErrorMessage } from "@/lib/api-error"

interface Props {
  orderId: string
}

export function ResendLinkButton({ orderId }: Props) {
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  const handleClick = async () => {
    setBusy(true)
    try {
      const res = await fetch(`/api/checkout/order/${orderId}/resend`, {
        method: "POST",
      })
      if (!res.ok) {
        throw new Error((await res.json()).error ?? "Couldn't send the email")
      }
      setSent(true)
      toast.success("Fresh link sent — check your inbox.")
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Couldn't resend the link"))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={busy || sent}
      size="lg"
      className="w-full gradient-primary text-white gap-2"
    >
      {busy ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Mail className="h-5 w-5" />
      )}
      {sent ? "Email sent" : busy ? "Sending..." : "Email me a fresh link"}
    </Button>
  )
}
