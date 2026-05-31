"use client"
import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getMessaging, isSupported, type Messaging } from "firebase/messaging"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
}

let app: FirebaseApp | undefined
let messaging: Messaging | undefined
let messagingChecked = false

function isConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId)
}

function getApp(): FirebaseApp {
  if (!app) app = getApps()[0] ?? initializeApp(firebaseConfig)
  return app
}

export async function getMessagingClient(): Promise<Messaging | null> {
  if (typeof window === "undefined") return null
  if (messagingChecked) return messaging ?? null
  messagingChecked = true
  if (!isConfigured()) return null
  try {
    const supported = await isSupported()
    if (!supported) return null
    if (!("Notification" in window)) return null
    messaging = getMessaging(getApp())
    return messaging
  } catch {
    return null
  }
}

export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? ""
