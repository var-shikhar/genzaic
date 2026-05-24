"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useNotifications,
  useMarkAllRead,
  useMarkRead,
} from "@/hooks/use-notifications"
import { NotificationRow } from "@/components/notifications/NotificationRow"

const FILTERS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
] as const

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const query = useNotifications(filter === "unread" ? { unread: true } : {})
  const { mutate: markAllRead } = useMarkAllRead()
  const { mutate: markRead } = useMarkRead()
  const items = query.data?.pages.flatMap((p) => p.items) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button variant="outline" size="sm" onClick={() => markAllRead({})}>
          Mark all read
        </Button>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          {FILTERS.map((f) => (
            <TabsTrigger key={f.value} value={f.value}>
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {query.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">You&apos;re all caught up.</div>
      ) : (
        <div className="border rounded-lg divide-y">
          {items.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              onClick={() => !n.isRead && markRead({ notificationIds: [n.id] })}
            />
          ))}
        </div>
      )}

      {query.hasNextPage && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
          >
            {query.isFetchingNextPage ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </div>
  )
}
