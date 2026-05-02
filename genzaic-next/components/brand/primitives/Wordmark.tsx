import { cn } from "@/lib/utils"

interface WordmarkProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeMap = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
  xl: "text-6xl",
} as const

export function Wordmark({ size = "md", className }: WordmarkProps) {
  return (
    <span
      className={cn(
        "font-display font-bold tracking-tight inline-block leading-none",
        sizeMap[size],
        className,
      )}
      aria-label="GenZaic"
    >
      G<span className="italic accent-word">en</span>Zaic
    </span>
  )
}
