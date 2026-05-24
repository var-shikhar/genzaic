"use client"

import { useInfiniteQuery, useQuery, type InfiniteData } from "@tanstack/react-query"
import { useOptimisticMutation } from "@/lib/react-query/use-optimistic-mutation"
import { getJSON, postJSON, putJSON } from "@/lib/react-query/fetcher"
import type { Notification, NotificationPreference } from "@/lib/db"

export const notificationKeys = {
  all: ["notifications"] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
  list: (filter: ListFilter) => [...notificationKeys.all, "list", filter] as const,
  preferences: () => [...notificationKeys.all, "preferences"] as const,
} as const

export type ListFilter = { unread?: boolean; type?: string }
export type ListPage = { items: Notification[]; nextCursor: string | null }

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => getJSON<{ count: number }>("/api/notifications/unread-count"),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  })
}

export function useNotifications(filter: ListFilter = {}) {
  return useInfiniteQuery<
    ListPage,
    Error,
    InfiniteData<ListPage>,
    readonly unknown[],
    string | null
  >({
    queryKey: notificationKeys.list(filter),
    initialPageParam: null,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams()
      if (pageParam) params.set("cursor", pageParam)
      if (filter.unread) params.set("unread", "true")
      if (filter.type) params.set("type", filter.type)
      const qs = params.toString()
      return getJSON<ListPage>(`/api/notifications${qs ? `?${qs}` : ""}`)
    },
    getNextPageParam: (last) => last.nextCursor,
  })
}

export function useMarkRead() {
  return useOptimisticMutation<{ notificationIds: string[] }, { ok: true }, never>({
    mutationFn: (input) => postJSON("/api/notifications/read", input),
    invalidateKeys: [notificationKeys.all],
  })
}

export function useMarkAllRead() {
  return useOptimisticMutation<
    { beforeDate?: string },
    { ok: true; updated: number },
    never
  >({
    mutationFn: (input) => postJSON("/api/notifications/read-all", input),
    invalidateKeys: [notificationKeys.all],
  })
}

export function usePreferences() {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: () => getJSON<NotificationPreference[]>("/api/notifications/preferences"),
  })
}

export function useUpdatePreference() {
  return useOptimisticMutation<
    { notificationType: string; inAppEnabled: boolean; emailEnabled: boolean },
    NotificationPreference,
    never
  >({
    mutationFn: (input) => putJSON("/api/notifications/preferences", input),
    invalidateKeys: [notificationKeys.preferences()],
  })
}

export function useRegisterDevice() {
  return useOptimisticMutation<
    { fcmToken: string; userAgent?: string },
    { ok: true },
    never
  >({
    mutationFn: (input) => postJSON("/api/notifications/devices", input),
  })
}
