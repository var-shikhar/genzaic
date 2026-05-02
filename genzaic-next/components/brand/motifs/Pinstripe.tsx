import { cn } from "@/lib/utils"

export function Pinstripe({
  spacing = 28,
  opacity = 0.18,
  direction = "vertical",
  className,
}: {
  spacing?: number
  opacity?: number
  direction?: "vertical" | "horizontal"
  className?: string
}) {
  const angle = direction === "vertical" ? "90deg" : "0deg"
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage: `repeating-linear-gradient(${angle}, hsl(var(--foreground) / ${opacity}) 0 1px, transparent 1px ${spacing}px)`,
      }}
    />
  )
}
