import { cn } from "@/lib/utils"

export function Halftone({
  className,
  variant = "signal",
}: {
  className?: string
  variant?: "iris" | "signal"
}) {
  const color = variant === "iris" ? "var(--accent)" : "var(--signal)"
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage: `radial-gradient(hsl(${color} / 0.55) 1.5px, transparent 1.6px)`,
        backgroundSize: "9px 9px",
        WebkitMaskImage: "linear-gradient(135deg, black 0%, transparent 80%)",
        maskImage: "linear-gradient(135deg, black 0%, transparent 80%)",
      }}
    />
  )
}
