import "server-only"
import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getMessaging, type Messaging } from "firebase-admin/messaging"
import { env } from "@/lib/env"

let app: App | undefined
let messaging: Messaging | undefined

/**
 * Returns the firebase-admin app and Messaging singleton.
 *
 * Throws if FIREBASE_SERVICE_ACCOUNT_KEY is not set — caller (the push
 * dispatcher) is responsible for handling the missing-creds case so the
 * cron worker doesn't crash before it can mark the outbox row failed.
 */
export function getFirebaseAdmin(): { app: App; messaging: Messaging } {
  if (!app) {
    const existing = getApps()
    if (existing.length > 0) {
      app = existing[0]
    } else {
      if (!env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        throw new Error(
          "FIREBASE_SERVICE_ACCOUNT_KEY is not set — cannot initialize firebase-admin",
        )
      }
      const serviceAccountJson = Buffer.from(
        env.FIREBASE_SERVICE_ACCOUNT_KEY,
        "base64",
      ).toString("utf8")
      const serviceAccount = JSON.parse(serviceAccountJson) as {
        project_id: string
        client_email: string
        private_key: string
      }
      app = initializeApp({
        credential: cert({
          projectId: serviceAccount.project_id,
          clientEmail: serviceAccount.client_email,
          privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
        }),
      })
    }
  }
  if (!messaging) messaging = getMessaging(app)
  return { app, messaging }
}
