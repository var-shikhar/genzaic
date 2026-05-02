import { cn } from "@/lib/utils"

export function Grid({
  size = 22,
  opacity = 0.08,
  centerDot = false,
  className,
}: {
  size?: number
  opacity?: number
  centerDot?: boolean
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage: `linear-gradient(hsl(var(--foreground) / ${opacity}) 1px, transparent 1px),
                          linear-gradient(90deg, hsl(var(--foreground) / ${opacity}) 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
      }}
    >
      {centerDot && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_0_6px_hsl(var(--primary)/0.18)]" />
      )}
    </div>
  )
}
