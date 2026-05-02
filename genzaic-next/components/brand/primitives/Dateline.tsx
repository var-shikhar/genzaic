import { cn } from "@/lib/utils"

interface DatelineProps {
  date: Date | string
  prefix?: string
  className?: string
}

export function Dateline({ date, prefix, className }: DatelineProps) {
  const d = typeof date === "string" ? new Date(date) : date
  const formatted = d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
  return (
    <span
      className={cn(
        "font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground",
        className,
      )}
    >
      {prefix ? `${prefix} · ` : ""}
      {formatted}
    </span>
  )
}
