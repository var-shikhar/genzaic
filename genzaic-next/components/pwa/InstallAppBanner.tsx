"use client"

import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePwaInstall } from "./use-pwa-install"

// When dismissed, suppress the banner for a few days instead of forever — this
// is the whole point of rolling our own prompt: we control re-engagement rather
// than letting Chrome go silent for ~90 days after a single dismissal.
const DISMISS_KEY = "pwa_install_dismissed_at"
const DISMISS_DAYS = 3
// Don't pop the banner the instant the page paints — let the user settle first.
const SHOW_DELAY_MS = 4000

export function InstallAppBanner() {
  const { isInstallable, canPromptNative, install, openInstructions } =
    usePwaInstall()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isInstallable) {
      setVisible(false)
      return
    }
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? "0")
    if (
      dismissedAt &&
      Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000
    )
      return

    const t = setTimeout(() => setVisible(true), SHOW_DELAY_MS)
    return () => clearTimeout(t)
  }, [isInstallable])

  if (!visible) return null

  // Engaged clicks don't write the suppression timestamp: if the user showed
  // interest but didn't finish installing, it's fine to surface again next
  // session. Only an explicit dismiss (the X) silences it for DISMISS_DAYS.
  const handleInstall = async () => {
    if (canPromptNative) {
      await install()
    } else {
      openInstructions()
    }
    setVisible(false)
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setVisible(false)
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none">
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-xl border bg-background p-3 shadow-lg pointer-events-auto">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg gradient-primary text-white">
          <Download className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Install GenZaic</p>
          <p className="text-xs text-muted-foreground">
            Add it to your home screen for quick access.
          </p>
        </div>
        <Button size="sm" onClick={handleInstall}>
          {canPromptNative ? "Install" : "How?"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDismiss}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
