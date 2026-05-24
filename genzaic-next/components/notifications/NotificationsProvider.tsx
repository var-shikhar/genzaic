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
      if (!messaging || !mounted) return

      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        try {
          const swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js")
          const token = await getToken(messaging, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: swReg,
          })
          if (token && mounted && token !== currentTokenRef.current) {
            currentTokenRef.current = token
            await register({ fcmToken: token, userAgent: navigator.userAgent }).catch(() => {})
          }
        } catch (err) {
          console.warn("[notifications] token registration failed", err)
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
