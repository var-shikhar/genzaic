import { cn } from "@/lib/utils"

export function EyebrowLabel({
  children,
  className,
  accent = false,
}: {
  children: React.ReactNode
  className?: string
  accent?: boolean
}) {
  return (
    <span
      className={cn(
        "font-mono text-[10px] uppercase tracking-[0.2em] font-semibold",
        accent ? "text-primary" : "text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  )
}
