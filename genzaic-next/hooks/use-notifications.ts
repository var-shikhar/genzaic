"use client"

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query"
import { useOptimisticMutation } from "@/lib/react-query/use-optimistic-mutation"
import { getJSON, postJSON, putJSON } from "@/lib/react-query/fetcher"
import type { Notification, NotificationPreference } from "@/lib/db"
import {
  notificationKeys,
  type ListFilter,
  type ListPage,
} from "./notification-keys"

// Re-export so existing client imports keep working; server components
// should pull from "@/hooks/notification-keys" directly.
export { notificationKeys }
export type { ListFilter, ListPage }

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
      if (filter.days && filter.days > 0) params.set("days", String(filter.days))
      const qs = params.toString()
      return getJSON<ListPage>(`/api/notifications${qs ? `?${qs}` : ""}`)
    },
    getNextPageParam: (last) => last.nextCursor,
    // Bell renders this everywhere; without polling the cache stays frozen
    // at whatever was there on mount and new notifs only show in the badge.
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })
}

type UnreadCountData = { count: number }
type ListInfiniteData = InfiniteData<ListPage>

// Snapshot/rollback helper shared by both mark-read mutations. Touches every
// cached list variant (All / Unread / day filters) plus the badge count.
function snapshotNotificationCaches(
  qc: ReturnType<typeof useQueryClient>,
) {
  const lists = qc.getQueriesData<ListInfiniteData>({
    queryKey: [...notificationKeys.all, "list"],
  })
  const counts = qc.getQueriesData<UnreadCountData>({
    queryKey: notificationKeys.unreadCount(),
  })
  return { lists, counts }
}

function restoreNotificationCaches(
  qc: ReturnType<typeof useQueryClient>,
  snapshot: ReturnType<typeof snapshotNotificationCaches>,
) {
  snapshot.lists.forEach(([key, data]) => qc.setQueryData(key, data))
  snapshot.counts.forEach(([key, data]) => qc.setQueryData(key, data))
}

export function useMarkRead() {
  const qc = useQueryClient()

  return useMutation<
    { ok: true },
    unknown,
    { notificationIds: string[] },
    { snapshot: ReturnType<typeof snapshotNotificationCaches> }
  >({
    mutationFn: (input) => postJSON("/api/notifications/read", input),
    onMutate: async ({ notificationIds }) => {
      await Promise.all([
        qc.cancelQueries({ queryKey: [...notificationKeys.all, "list"] }),
        qc.cancelQueries({ queryKey: notificationKeys.unreadCount() }),
      ])
      const snapshot = snapshotNotificationCaches(qc)
      const idSet = new Set(notificationIds)
      const now = new Date()

      // Optimistic list update: flip isRead on the affected rows, in every
      // cached filter variant. Unread filter rows are kept in place (don't
      // yank them mid-click) — they'll drop on the next refetch.
      snapshot.lists.forEach(([key, data]) => {
        if (!data) return
        const next: ListInfiniteData = {
          ...data,
          pages: data.pages.map((p) => ({
            ...p,
            items: p.items.map((n: Notification) =>
              idSet.has(n.id) && !n.isRead
                ? { ...n, isRead: true, readAt: now }
                : n,
            ),
          })),
        }
        qc.setQueryData(key, next)
      })

      // Optimistic badge: decrement by however many of the affected ids were
      // actually unread in the cache. Falls back to full decrement if we
      // can't tell (e.g. cache miss).
      let unreadFlipped = 0
      snapshot.lists.forEach(([, data]) => {
        data?.pages.forEach((p) =>
          p.items.forEach((n) => {
            if (idSet.has(n.id) && !n.isRead) unreadFlipped += 1
          }),
        )
      })
      const delta = unreadFlipped || notificationIds.length
      snapshot.counts.forEach(([key, data]) => {
        if (!data) return
        qc.setQueryData<UnreadCountData>(key, {
          count: Math.max(0, data.count - delta),
        })
      })

      return { snapshot }
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.snapshot) restoreNotificationCaches(qc, ctx.snapshot)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()

  return useMutation<
    { ok: true; updated: number },
    unknown,
    { beforeDate?: string },
    { snapshot: ReturnType<typeof snapshotNotificationCaches> }
  >({
    mutationFn: (input) => postJSON("/api/notifications/read-all", input),
    onMutate: async () => {
      await Promise.all([
        qc.cancelQueries({ queryKey: [...notificationKeys.all, "list"] }),
        qc.cancelQueries({ queryKey: notificationKeys.unreadCount() }),
      ])
      const snapshot = snapshotNotificationCaches(qc)
      const now = new Date()

      snapshot.lists.forEach(([key, data]) => {
        if (!data) return
        qc.setQueryData<ListInfiniteData>(key, {
          ...data,
          pages: data.pages.map((p) => ({
            ...p,
            items: p.items.map((n: Notification) =>
              n.isRead ? n : { ...n, isRead: true, readAt: now },
            ),
          })),
        })
      })

      snapshot.counts.forEach(([key]) => {
        qc.setQueryData<UnreadCountData>(key, { count: 0 })
      })

      return { snapshot }
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.snapshot) restoreNotificationCaches(qc, ctx.snapshot)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all })
    },
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
