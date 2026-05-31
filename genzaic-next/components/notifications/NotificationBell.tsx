"use client"

import { useState } from "react"
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
import { NotificationsDrawer } from "./NotificationsDrawer"

export function NotificationBell() {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { data: unread } = useUnreadCount()
  const { data, isLoading } = useNotifications()
  const items = data?.pages.flatMap((p) => p.items) ?? []
  const top10 = items.slice(0, 10)
  const { mutate: markRead } = useMarkRead()
  const { mutate: markAllRead } = useMarkAllRead()
  const count = unread?.count ?? 0

  const openDrawer = () => {
    setPopoverOpen(false)
    setDrawerOpen(true)
  }

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
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
                    onClick={() => {
                      if (!n.isRead) markRead({ notificationIds: [n.id] })
                      if (n.link) setPopoverOpen(false)
                    }}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={openDrawer}
              className="w-full text-xs"
            >
              See all
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <NotificationsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  )
}
