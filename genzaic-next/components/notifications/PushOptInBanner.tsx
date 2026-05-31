"use client"

import { useEffect, useState } from "react"
import { Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getMessagingClient, VAPID_KEY } from "@/lib/firebase/client"
import { getToken } from "firebase/messaging"
import { useSession } from "next-auth/react"
import { useRegisterDevice } from "@/hooks/use-notifications"

const DISMISS_KEY = "notif_optin_dismissed_at"
const DISMISS_DAYS = 7
const FLAG = process.env.NEXT_PUBLIC_NOTIFICATIONS_OPT_IN_ENABLED === "true"

export function PushOptInBanner() {
  const { status } = useSession()
  const { mutateAsync: register } = useRegisterDevice()
  const [shouldShow, setShouldShow] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!FLAG) return
    if (status !== "authenticated") return
    if (typeof window === "undefined" || !("Notification" in window)) return
    if (Notification.permission !== "default") return

    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? "0")
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) return

    const t = setTimeout(() => setShouldShow(true), 30_000)
    return () => clearTimeout(t)
  }, [status])

  if (!shouldShow) return null

  async function handleEnable() {
    setBusy(true)
    try {
      const perm = await Notification.requestPermission()
      if (perm !== "granted") {
        setShouldShow(false)
        return
      }
      const messaging = await getMessagingClient()
      if (!messaging) return
      const swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js")
      // register() resolves once the SW is registered, but the worker may
      // still be in "installing" or "waiting" state. getToken() immediately
      // calls pushManager.subscribe() which requires an *active* worker —
      // without this wait the very first opt-in throws AbortError: "no
      // active Service Worker". serviceWorker.ready resolves once a SW
      // controls this scope.
      await navigator.serviceWorker.ready
      const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swReg })
      if (token) await register({ fcmToken: token, userAgent: navigator.userAgent })
      setShouldShow(false)
    } finally {
      setBusy(false)
    }
  }

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setShouldShow(false)
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 border-b text-sm">
      <Bell className="h-4 w-4 text-primary shrink-0" />
      <p className="flex-1">
        Get notified about orders, payouts and replies — even when this tab isn&apos;t open.
      </p>
      <Button size="sm" onClick={handleEnable} disabled={busy}>
        {busy ? "Enabling…" : "Enable"}
      </Button>
      <Button size="sm" variant="ghost" onClick={handleDismiss} aria-label="Dismiss">
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
