"use client"

import Link from "next/link"
import { Bell } from "lucide-react"
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  useUnreadCount,
  useNotifications,
  useMarkRead,
  useMarkAllRead,
} from "@/hooks/use-notifications"
import { NotificationRow } from "./NotificationRow"

export function NotificationBell() {
  const { data: unread } = useUnreadCount()
  const { data, isLoading } = useNotifications()
  const items = data?.pages.flatMap((p) => p.items) ?? []
  const top10 = items.slice(0, 10)
  const { mutate: markRead } = useMarkRead()
  const { mutate: markAllRead } = useMarkAllRead()
  const count = unread?.count ?? 0

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 text-[10px] flex items-center justify-center"
              variant="destructive"
            >
              {count > 9 ? "9+" : count}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <h3 className="text-sm font-semibold">Notifications</h3>
          <Button
            variant="ghost"
            size="sm"
            disabled={count === 0}
            onClick={() => markAllRead({})}
            className="text-xs h-7"
          >
            Mark all read
          </Button>
        </div>
        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="p-3 space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : top10.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              You&apos;re all caught up.
            </div>
          ) : (
            <div className="p-1">
              {top10.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onClick={() => !n.isRead && markRead({ notificationIds: [n.id] })}
                />
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="border-t p-2">
          <Button variant="ghost" size="sm" asChild className="w-full text-xs">
            <Link href="/notifications">See all</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
