"use client"

import { useSyncAuthStore } from "@/hooks/use-sync-auth-store"

export function AuthSync() {
  useSyncAuthStore()
  return null
}
