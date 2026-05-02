import { cn } from "@/lib/utils"

export function PostalRing({
  children,
  rotate = -8,
  size = 80,
  variant = "ink",
  className,
}: {
  children: React.ReactNode
  rotate?: number
  size?: number
  variant?: "ink" | "iris" | "flicker"
  className?: string
}) {
  const color =
    variant === "ink" ? "hsl(var(--foreground))" :
    variant === "iris" ? "hsl(var(--accent))" :
    "hsl(var(--signal))"
  return (
    <div
      className={cn(
        "relative flex items-center justify-center font-mono text-[9px] uppercase tracking-[0.12em] leading-tight text-center p-2",
        className,
      )}
      style={{
        width: size,
        height: size,
        border: `1.5px solid ${color}`,
        borderRadius: "50%",
        color,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <div
        className="absolute inset-1 rounded-full pointer-events-none"
        style={{ border: `1px dashed ${color}`, opacity: 0.4 }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}
