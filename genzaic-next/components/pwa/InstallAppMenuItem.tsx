"use client"

import { Download } from "lucide-react"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { usePwaInstall } from "./use-pwa-install"

// A persistent "Install app" entry for profile dropdowns — the always-available
// fallback so users who dismissed the banner (or never saw it) can still
// install on demand. Hides itself once installed / when nothing can be offered.
export function InstallAppMenuItem() {
  const { isInstallable, canPromptNative, install, openInstructions } =
    usePwaInstall()

  if (!isInstallable) return null

  return (
    <DropdownMenuItem
      onSelect={(e) => {
        // Keep the menu open long enough to hand off to the native prompt /
        // instructions dialog without a focus-trap race.
        e.preventDefault()
        if (canPromptNative) install()
        else openInstructions()
      }}
    >
      <Download className="mr-2 h-4 w-4" />
      Install app
    </DropdownMenuItem>
  )
}
