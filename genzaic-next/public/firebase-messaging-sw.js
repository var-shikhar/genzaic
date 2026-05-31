/* eslint-disable */
// Firebase Cloud Messaging service worker for background push.
// Service workers cannot read process.env, so the public Firebase config below
// must be hand-synced with NEXT_PUBLIC_FIREBASE_* values in .env.local /
// Vercel project settings. These are public identifiers (safe to expose).
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js")

firebase.initializeApp({
  apiKey: "AIzaSyBv5Dn18ErpHsQWJJ5mvcSP-UmAt12lNhU",
  authDomain: "genzaic-a03e7.firebaseapp.com",
  projectId: "genzaic-a03e7",
  messagingSenderId: "610379344771",
  appId: "1:610379344771:web:8c0a6eb8e8f355b796e4b6",
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "GenZaic"
  const body = payload.notification?.body || ""
  // Fallback target when a push arrives without an explicit link. /notifications
  // was retired in favour of the bell-triggered drawer, so route clicks to the
  // dashboard instead.
  const link = payload.data?.link || "/dashboard"
  self.registration.showNotification(title, {
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { link },
  })
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const link = event.notification.data?.link || "/dashboard"
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((wins) => {
      for (const w of wins) {
        if (w.url.includes(link) && "focus" in w) return w.focus()
      }
      if (clients.openWindow) return clients.openWindow(link)
    })
  )
})
