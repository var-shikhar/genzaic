"use client"

import { useQuery } from "@tanstack/react-query"
import { getJSON } from "@/lib/react-query/fetcher"
import { cn } from "@/lib/utils"

interface DayActivity {
  date: string
  sales: number
  views: number
  drops: number
}

function useWeekActivity() {
  return useQuery({
    queryKey: ["dashboard", "week-activity"],
    queryFn: async () => {
      try {
        const res = await getJSON<{ days: DayActivity[] }>("/api/dashboard/week")
        return res.days
      } catch {
        const days: DayActivity[] = []
        for (let i = 6; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          days.push({ date: d.toISOString().slice(0, 10), sales: 0, views: 0, drops: 0 })
        }
        return days
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function WeekStrip() {
  const { data: days = [] } = useWeekActivity()
  const today = new Date().toISOString().slice(0, 10)

  return (
    <section className="pt-6 border-t border-foreground">
      <div className="flex justify-between items-baseline mb-4">
        <h3 className="font-display italic text-lg text-muted-foreground font-medium">The week —</h3>
        <div className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground space-x-3">
          <span><span className="text-primary">●</span> sale</span>
          <span><span className="text-foreground/30">●</span> view</span>
          <span><span className="text-flicker">●</span> drop</span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const date = new Date(d.date)
          const isToday = d.date === today
          const wd = date.toLocaleDateString("en-GB", { weekday: "short" })
          return (
            <div
              key={d.date}
              className={cn(
                "p-3 rounded-md border min-h-[88px]",
                isToday
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border",
              )}
            >
              <div className={cn(
                "font-mono text-[10px] tracking-[0.1em]",
                isToday ? "text-background/80" : "text-muted-foreground",
              )}>{isToday ? `${wd} · Today` : wd}</div>
              <div className="font-display text-xl font-semibold tracking-[-0.02em] mt-0.5">
                {date.getDate().toString().padStart(2, "0")}
              </div>
              <div className="flex gap-[3px] mt-2 flex-wrap">
                {Array.from({ length: d.sales }).map((_, i) => (
                  <span key={`s${i}`} className="w-1.5 h-1.5 rounded-full bg-primary" />
                ))}
                {Array.from({ length: Math.min(d.views, 6) }).map((_, i) => (
                  <span key={`v${i}`} className="w-1.5 h-1.5 rounded-full bg-foreground/25" />
                ))}
                {Array.from({ length: d.drops }).map((_, i) => (
                  <span key={`d${i}`} className="w-1.5 h-1.5 rounded-full bg-flicker" />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
