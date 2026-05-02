import { cn } from "@/lib/utils"

export function MonoLabel({
  children,
  className,
  size = "sm",
}: {
  children: React.ReactNode
  className?: string
  size?: "xs" | "sm" | "md"
}) {
  const sizeMap = { xs: "text-[9px]", sm: "text-[10px]", md: "text-xs" }
  return (
    <span
      className={cn(
        "font-mono uppercase tracking-[0.15em] text-muted-foreground",
        sizeMap[size],
        className,
      )}
    >
      {children}
    </span>
  )
}
