import { cn } from "@/lib/utils"

interface BloomProps {
  variant?: "iris" | "flicker"
  position?: "tr" | "br" | "bl" | "tl"
  animated?: boolean
  className?: string
}

const posMap = {
  tr: "right-[-50px] top-[-50px]",
  br: "right-[-50px] bottom-[-50px]",
  bl: "left-[-50px] bottom-[-50px]",
  tl: "left-[-50px] top-[-50px]",
}

export function Bloom({
  variant = "iris",
  position = "tr",
  animated = false,
  className,
}: BloomProps) {
  const color = variant === "iris" ? "var(--accent)" : "var(--signal)"
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute w-[220px] h-[220px] rounded-full",
        posMap[position],
        animated && "motion-bloom",
        className,
      )}
      style={{
        background: `radial-gradient(circle, hsl(${color} / 0.7), transparent 60%)`,
        animation: animated ? "brand-bloom 6s ease-in-out infinite" : undefined,
      }}
    />
  )
}
