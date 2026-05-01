"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useAuthStore, type AuthUser } from "@/lib/stores/auth"

export function useSyncAuthStore() {
  const { data: session, status } = useSession()
  const setUser = useAuthStore((s) => s.setUser)
  const clear = useAuthStore((s) => s.clear)

  useEffect(() => {
    if (status === "loading") return
    if (!session?.user) {
      clear()
      return
    }
    const u = session.user as AuthUser & { id?: string }
    setUser({
      id: u.id ?? "",
      name: u.name ?? null,
      email: u.email ?? null,
      image: u.image ?? null,
      storeUrl: u.storeUrl ?? null,
      isSeller: u.isSeller ?? undefined,
      role: u.role ?? undefined,
    })
  }, [session, status, setUser, clear])
}
