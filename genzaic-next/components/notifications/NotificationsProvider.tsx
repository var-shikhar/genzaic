"use client"

import { useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getToken, onMessage, deleteToken } from "firebase/messaging"
import { getMessagingClient, VAPID_KEY } from "@/lib/firebase/client"
import {
  notificationKeys,
  useRegisterDevice,
} from "@/hooks/use-notifications"

const debug = process.env.NODE_ENV !== "production"

export function NotificationsProvider() {
  const { data: session, status } = useSession()
  const qc = useQueryClient()
  const router = useRouter()
  const { mutateAsync: register } = useRegisterDevice()
  const currentTokenRef = useRef<string | null>(null)

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return
    let unsub: (() => void) | undefined
    let mounted = true

    ;(async () => {
      const messaging = await getMessagingClient()
      if (!messaging) {
        if (debug) console.warn("[push] messaging unsupported in this browser")
        return
      }
      if (!mounted) return

      if (typeof Notification === "undefined") {
        if (debug) console.warn("[push] Notification API missing")
        return
      }
      if (Notification.permission !== "granted") {
        if (debug) console.info("[push] permission =", Notification.permission, "— skipping token registration")
        // Still attach the foreground listener below so granting via banner
        // doesn't require a page reload.
      } else {
        try {
          if (debug) console.info("[push] registering service worker…")
          const swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js")
          // Wait for activation before subscribing — see PushOptInBanner for
          // the longer explanation. getToken() calls pushManager.subscribe()
          // which requires an active worker.
          await navigator.serviceWorker.ready
          if (debug) console.info("[push] sw active, requesting FCM token…")
          const token = await getToken(messaging, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: swReg,
          })
          if (!token) {
            if (debug) console.warn("[push] getToken returned empty — VAPID key wrong, or push service blocked")
          } else if (mounted && token !== currentTokenRef.current) {
            currentTokenRef.current = token
            if (debug) console.info("[push] token acquired, registering with server:", token.slice(0, 16) + "…")
            await register({ fcmToken: token, userAgent: navigator.userAgent })
              .then(() => debug && console.info("[push] device registered ✓"))
              .catch((err) => console.warn("[push] device registration failed:", err))
          } else if (debug) {
            console.info("[push] token unchanged, skipping re-register")
          }
        } catch (err) {
          console.warn("[push] token registration failed", err)
        }
      }

      unsub = onMessage(messaging, (payload) => {
        qc.invalidateQueries({ queryKey: notificationKeys.all })
        const title = payload.notification?.title ?? "Notification"
        const body = payload.notification?.body ?? ""
        const link = payload.data?.link as string | undefined
        toast(title, {
          description: body,
          action: link ? { label: "Open", onClick: () => router.push(link) } : undefined,
        })
      })
    })()

    return () => {
      mounted = false
      unsub?.()
    }
  }, [status, session?.user, qc, router, register])

  useEffect(() => {
    if (status === "unauthenticated" && currentTokenRef.current) {
      const token = currentTokenRef.current
      currentTokenRef.current = null
      fetch("/api/notifications/devices", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fcmToken: token }),
      }).catch(() => {})
      ;(async () => {
        const messaging = await getMessagingClient()
        if (messaging) deleteToken(messaging).catch(() => {})
      })()
    }
  }, [status])

  return null
}
