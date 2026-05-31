// Shared query keys + types for notifications. Lives outside the
// "use client" boundary so server components (notifications page prefetch)
// can call the factory directly. See lib/queries/products-keys.ts for the
// full explanation.

import type { Notification } from "@/lib/db"

export type ListFilter = { unread?: boolean; type?: string; days?: number }
export type ListPage = { items: Notification[]; nextCursor: string | null }

export const notificationKeys = {
  all: ["notifications"] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
  list: (filter: ListFilter) => [...notificationKeys.all, "list", filter] as const,
  preferences: () => [...notificationKeys.all, "preferences"] as const,
} as const
