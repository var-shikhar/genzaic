"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { ArrowUpRight, Package } from "lucide-react"
import { getJSON } from "@/lib/react-query/fetcher"
import { cn, formatCurrency } from "@/lib/utils"

interface DayActivity {
  date: string
  sales: number
  drops: number
}

interface WeekOrder {
  id: string
  orderNumber: string
  productTitle: string
  productThumbnail: string | null
  buyerName: string
  totalAmount: string
  status: "pending" | "completed"
  createdAt: string
}

interface WeekPayload {
  days: DayActivity[]
  orders: WeekOrder[]
}

function useWeekActivity() {
  return useQuery({
    queryKey: ["dashboard", "week-activity"],
    queryFn: async (): Promise<WeekPayload> => {
      try {
        return await getJSON<WeekPayload>("/api/dashboard/week")
      } catch {
        const days: DayActivity[] = []
        for (let i = 6; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          days.push({
            date: d.toISOString().slice(0, 10),
            sales: 0,
            drops: 0,
          })
        }
        return { days, orders: [] }
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * 7-day activity strip on the dashboard. Top row is a filter — a pill per
 * day, today preselected. Below, a list of completed orders for the
 * selected day. Empty days surface an empty state so the section still
 * feels intentional when the seller has had a quiet day.
 */
export function WeekStrip() {
  const { data } = useWeekActivity()
  const days = data?.days ?? []
  const orders = data?.orders ?? []
  const today = new Date().toISOString().slice(0, 10)
  const [selected, setSelected] = useState<string>(today)

  const ordersByDay = useMemo(() => {
    const map = new Map<string, WeekOrder[]>()
    for (const o of orders) {
      const key = new Date(o.createdAt).toISOString().slice(0, 10)
      const list = map.get(key) ?? []
      list.push(o)
      map.set(key, list)
    }
    return map
  }, [orders])

  const selectedOrders = ordersByDay.get(selected) ?? []
  const selectedDate = new Date(selected)
  const selectedLabel = selectedDate.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
  })

  return (
    <section className="pt-6 border-t border-foreground">
      <div className="flex justify-between items-baseline mb-4">
        <h3 className="font-display italic text-lg text-muted-foreground font-medium">
          The week —
        </h3>
        <p className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground">
          tap a day · {selected === today ? "today" : selectedLabel.split(",")[0]}
        </p>
      </div>

      {/* Filter strip */}
      <div
        role="tablist"
        aria-label="Filter by day"
        className="flex gap-1 sm:gap-1.5 overflow-x-auto pb-1"
      >
        {days.map((d) => (
          <DayPill
            key={d.date}
            day={d}
            isToday={d.date === today}
            isSelected={d.date === selected}
            onSelect={() => setSelected(d.date)}
          />
        ))}
      </div>

      {/* Selected-day activity */}
      <div className="mt-5">
        <div className="flex items-baseline justify-between mb-2">
          <h4 className="font-display text-base font-semibold tracking-[-0.01em]">
            {selected === today ? "Today" : selectedLabel}
          </h4>
          {selectedOrders.length > 0 && (
            <Link
              href="/dashboard/sales"
              className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground hover:text-primary inline-flex items-center gap-1"
            >
              All sales <ArrowUpRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {selectedOrders.length === 0 ? (
          <EmptyDay isToday={selected === today} />
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border bg-card">
            {selectedOrders.map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

// ─── Day pill ────────────────────────────────────────────────────────────────

interface DayPillProps {
  day: DayActivity
  isToday: boolean
  isSelected: boolean
  onSelect: () => void
}

function DayPill({ day, isToday, isSelected, onSelect }: DayPillProps) {
  const date = new Date(day.date)
  const wd = date.toLocaleDateString("en-GB", { weekday: "short" })
  const hasSales = day.sales > 0
  const hasDrops = day.drops > 0

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      onClick={onSelect}
      className={cn(
        "flex-1 min-w-[60px] px-2 py-2 sm:py-2.5 rounded-md border text-left transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isSelected
          ? "border-primary bg-primary text-primary-foreground"
          : isToday
            ? "border-primary/40 bg-primary/[0.04] hover:bg-primary/[0.08]"
            : "border-border bg-card hover:border-primary/40",
      )}
    >
      <div
        className={cn(
          "font-mono text-[9px] tracking-[0.12em] uppercase",
          isSelected
            ? "text-background/80"
            : isToday
              ? "text-primary"
              : "text-muted-foreground",
        )}
      >
        {isToday ? (
          <>
            <span className="sm:hidden">Today</span>
            <span className="hidden sm:inline">{wd} · today</span>
          </>
        ) : (
          wd
        )}
      </div>
      <div className="flex items-baseline justify-between mt-0.5 gap-1">
        <div className="font-display text-lg font-semibold tracking-[-0.02em] tabular-nums">
          {date.getDate().toString().padStart(2, "0")}
        </div>
        <div className="flex items-center gap-1">
          {hasSales && (
            <span
              aria-label={`${day.sales} sale${day.sales === 1 ? "" : "s"}`}
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                isSelected ? "bg-background" : "bg-primary",
              )}
            />
          )}
          {hasDrops && (
            <span
              aria-label={`${day.drops} drop${day.drops === 1 ? "" : "s"}`}
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                isSelected ? "bg-background/70" : "bg-flicker",
              )}
            />
          )}
        </div>
      </div>
    </button>
  )
}

// ─── Order row ───────────────────────────────────────────────────────────────

function OrderRow({ order }: { order: WeekOrder }) {
  const t = new Date(order.createdAt)
  const time = t.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })
  const isPending = order.status === "pending"

  return (
    <li>
      <Link
        href={`/dashboard/sales?orderId=${order.id}`}
        className="flex items-center gap-3 p-3 hover:bg-muted/40 transition-colors"
      >
        <div className="relative w-10 h-10 rounded-md overflow-hidden bg-muted shrink-0">
          {order.productThumbnail ? (
            <Image
              src={order.productThumbnail}
              alt={order.productTitle}
              fill
              sizes="40px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="font-display text-sm font-medium truncate">
              {order.productTitle}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground tracking-[0.08em] shrink-0">
              · {time}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[9px] uppercase tracking-[0.12em]",
                isPending
                  ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                  : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
              )}
            >
              {order.status}
            </span>
            <p className="font-display italic text-xs text-muted-foreground truncate">
              {order.buyerName}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div
            className={cn(
              "font-display text-sm font-semibold tabular-nums",
              isPending && "text-muted-foreground",
            )}
          >
            {formatCurrency(order.totalAmount)}
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
            #{order.orderNumber}
          </div>
        </div>
      </Link>
    </li>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyDay({ isToday }: { isToday: boolean }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-card/40 px-4 py-6 text-center">
      <p className="font-display italic text-sm text-muted-foreground">
        {isToday
          ? "No sales yet today. A quiet desk — for now."
          : "Nothing on this day."}
      </p>
    </div>
  )
}
