"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { getApiErrorMessage } from "@/lib/api-error"

interface Props {
  orderId: string
  /** Access token from the URL — present for guests, null for logged-in buyers. */
  accessToken: string | null
}

/**
 * Click handler asks the server for a freshly-signed file URL and opens it
 * in a new tab. The signed URL itself expires in ~5 minutes — so even if
 * the buyer copies the actual download link from devtools, it dies fast.
 */
export function OrderDownloadButton({ orderId, accessToken }: Props) {
  const [busy, setBusy] = useState(false)

  const handleClick = async () => {
    setBusy(true)
    try {
      const res = await fetch(`/api/checkout/order/${orderId}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: accessToken }),
      })
      if (!res.ok) {
        throw new Error((await res.json()).error ?? "Download failed")
      }
      const { url } = (await res.json()) as { url: string }
      window.open(url, "_blank", "noopener,noreferrer")
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Couldn't fetch the download link"))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={busy}
      size="lg"
      className="w-full gradient-primary text-white gap-2"
    >
      {busy ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Download className="h-5 w-5" />
      )}
      {busy ? "Preparing..." : "Download now"}
    </Button>
  )
}
