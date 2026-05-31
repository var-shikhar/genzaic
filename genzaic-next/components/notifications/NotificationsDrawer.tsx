"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  useUnreadCount,
  type ListFilter,
} from "@/hooks/use-notifications"
import { NotificationRow } from "./NotificationRow"

const FILTERS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
] as const

// 0 = no limit ("All time"). Values are in days.
const RANGE_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "0", label: "All time" },
] as const

export function NotificationsDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [tab, setTab] = useState<"all" | "unread">("all")
  const [range, setRange] = useState<string>("30")

  const filter: ListFilter = {}
  if (tab === "unread") filter.unread = true
  const days = Number(range)
  if (days > 0) filter.days = days

  const query = useNotifications(filter)
  const { data: unread } = useUnreadCount()
  const { mutate: markAllRead } = useMarkAllRead()
  const { mutate: markRead } = useMarkRead()
  const items = query.data?.pages.flatMap((p) => p.items) ?? []
  const unreadCount = unread?.count ?? 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col gap-0"
      >
        {/* pr-12 leaves room for the absolutely-positioned SheetContent close
            X (right-4 top-4) so Mark-all-read doesn't slide underneath it. */}
        <div className="px-5 py-4 pr-12 border-b flex items-center justify-between gap-3">
          <SheetTitle className="text-lg font-semibold">Notifications</SheetTitle>
          <Button
            variant="outline"
            size="sm"
            disabled={unreadCount === 0}
            onClick={() => markAllRead({})}
          >
            Mark all read
          </Button>
        </div>

        <div className="px-5 py-3 border-b flex items-center justify-between gap-3 flex-wrap">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList>
              {FILTERS.map((f) => (
                <TabsTrigger key={f.value} value={f.value}>
                  {f.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="h-8 w-[150px] text-xs">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map((r) => (
                <SelectItem key={r.value} value={r.value} className="text-xs">
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3">
            {query.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                You&apos;re all caught up.
              </div>
            ) : (
              <div className="space-y-1">
                {items.map((n) => (
                  <NotificationRow
                    key={n.id}
                    notification={n}
                    onClick={() => {
                      if (!n.isRead) markRead({ notificationIds: [n.id] })
                      if (n.link) onOpenChange(false)
                    }}
                  />
                ))}
              </div>
            )}

            {query.hasNextPage && (
              <div className="text-center mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => query.fetchNextPage()}
                  disabled={query.isFetchingNextPage}
                >
                  {query.isFetchingNextPage ? "Loading…" : "Load more"}
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
