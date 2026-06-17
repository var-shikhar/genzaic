"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { Plus, Share, MoreVertical } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Browsers behave very differently around PWA installation:
//   - Chromium (Chrome/Edge/Brave/Opera/Samsung) fires `beforeinstallprompt`,
//     which we capture so WE decide when to show the install UI (instead of
//     the browser deciding once and then suppressing itself for ~90 days).
//   - iOS Safari + Firefox never fire that event — installation is manual, so
//     all we can do is show step-by-step instructions.
// This provider centralises the captured event and platform detection so the
// banner and the menu item share a single source of truth (the event can only
// be used once, so two independent listeners would fight over it).
type Platform = "ios" | "firefox" | "chromium" | "other"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

interface PwaInstallContextValue {
  platform: Platform
  /** App is already installed / running in standalone mode. */
  isInstalled: boolean
  /** A native `beforeinstallprompt` event is captured and ready to fire. */
  canPromptNative: boolean
  /** We can offer installation in some form (native prompt OR manual steps). */
  isInstallable: boolean
  /** Fire the native prompt if available, otherwise open the instructions. */
  install: () => Promise<void>
  /** Force-open the manual instructions dialog. */
  openInstructions: () => void
}

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null)

export function usePwaInstall(): PwaInstallContextValue {
  const ctx = useContext(PwaInstallContext)
  if (!ctx)
    throw new Error("usePwaInstall must be used within <PwaInstallProvider>")
  return ctx
}

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other"
  const ua = navigator.userAgent.toLowerCase()
  // iPadOS 13+ masquerades as desktop Safari, so fall back to touch detection.
  const isIOS =
    /iphone|ipad|ipod/.test(ua) ||
    (/macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  if (isIOS) return "ios"
  if (/firefox\/|fxios/.test(ua)) return "firefox"
  if (/chrome|crios|edg|opr\/|samsungbrowser/.test(ua)) return "chromium"
  return "other"
}

function detectStandalone(): boolean {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari exposes its own non-standard flag.
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  )
}

export function PwaInstallProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [platform, setPlatform] = useState<Platform>("other")
  const [instructionsOpen, setInstructionsOpen] = useState(false)

  useEffect(() => {
    setPlatform(detectPlatform())
    setIsInstalled(detectStandalone())

    const onBeforeInstall = (e: Event) => {
      // Stop Chrome's own mini-infobar; we render our own UI instead.
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  const openInstructions = useCallback(() => setInstructionsOpen(true), [])

  const install = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      // The captured event is single-use — drop it once consumed.
      setDeferredPrompt(null)
      if (choice.outcome === "accepted") setIsInstalled(true)
      return
    }
    // No native prompt (iOS / Firefox / Chrome suppressed it) → manual steps.
    setInstructionsOpen(true)
  }, [deferredPrompt])

  const canPromptNative = deferredPrompt !== null
  const isInstallable =
    !isInstalled &&
    (canPromptNative || platform === "ios" || platform === "firefox")

  const value = useMemo<PwaInstallContextValue>(
    () => ({
      platform,
      isInstalled,
      canPromptNative,
      isInstallable,
      install,
      openInstructions,
    }),
    [platform, isInstalled, canPromptNative, isInstallable, install, openInstructions],
  )

  return (
    <PwaInstallContext.Provider value={value}>
      {children}
      <InstallInstructionsDialog
        open={instructionsOpen}
        onOpenChange={setInstructionsOpen}
        platform={platform}
      />
    </PwaInstallContext.Provider>
  )
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full gradient-primary text-xs font-semibold text-white">
        {n}
      </span>
      <span className="pt-0.5">{children}</span>
    </li>
  )
}

function InstallInstructionsDialog({
  open,
  onOpenChange,
  platform,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  platform: Platform
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Install GenZaic</DialogTitle>
          <DialogDescription>
            Add GenZaic to your home screen for a faster, app-like experience.
          </DialogDescription>
        </DialogHeader>

        {platform === "ios" ? (
          <ol className="space-y-3 text-sm">
            <Step n={1}>
              Tap the{" "}
              <strong className="inline-flex items-center gap-1">
                Share <Share className="h-4 w-4" />
              </strong>{" "}
              icon in Safari&apos;s toolbar.
            </Step>
            <Step n={2}>
              Scroll down and tap{" "}
              <strong className="inline-flex items-center gap-1">
                Add to Home Screen <Plus className="h-4 w-4" />
              </strong>
              .
            </Step>
            <Step n={3}>
              Tap <strong>Add</strong> in the top-right corner.
            </Step>
          </ol>
        ) : platform === "firefox" ? (
          <ol className="space-y-3 text-sm">
            <Step n={1}>
              Open the browser menu{" "}
              <strong className="inline-flex items-center gap-1">
                <MoreVertical className="h-4 w-4" />
              </strong>
              .
            </Step>
            <Step n={2}>
              Choose <strong>Install</strong> (or{" "}
              <strong>Add to Home screen</strong> on Android).
            </Step>
          </ol>
        ) : (
          <ol className="space-y-3 text-sm">
            <Step n={1}>
              Open the browser menu{" "}
              <strong className="inline-flex items-center gap-1">
                <MoreVertical className="h-4 w-4" />
              </strong>{" "}
              (or look for the install icon in the address bar).
            </Step>
            <Step n={2}>
              Choose <strong>Install GenZaic…</strong> /{" "}
              <strong>Add to Home screen</strong>.
            </Step>
          </ol>
        )}
      </DialogContent>
    </Dialog>
  )
}
