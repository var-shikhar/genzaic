"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePwaInstall } from "./use-pwa-install"

export function InstallAppBanner() {
  const { isInstallable, canPromptNative, install, openInstructions } =
    usePwaInstall()

  // The banner stays pinned for as long as the app can be installed. There's no
  // dismiss — it only disappears once `isInstallable` flips to false, which
  // happens when the `appinstalled` event fires (or the app launches in
  // standalone mode).
  if (!isInstallable) return null

  const handleInstall = async () => {
    if (canPromptNative) {
      await install()
    } else {
      openInstructions()
    }
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
      </div>
    </div>
  )
}
