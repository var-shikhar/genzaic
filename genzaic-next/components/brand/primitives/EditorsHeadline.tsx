import { cn } from "@/lib/utils"

interface EditorsHeadlineProps {
  children: React.ReactNode
  /** A word inside the headline that should render in italic accent color. */
  accentWord?: string
  /** Use signal (Flicker) instead of Iris for the accent word. */
  signal?: boolean
  size?: "sm" | "md" | "lg" | "xl" | "hero"
  className?: string
  as?: "h1" | "h2" | "h3"
}

const sizeMap = {
  sm:   "text-2xl tracking-[-0.02em]",
  md:   "text-3xl tracking-[-0.025em]",
  lg:   "text-5xl tracking-[-0.035em] leading-[0.95]",
  xl:   "text-6xl tracking-[-0.04em] leading-[0.92]",
  hero: "text-7xl tracking-[-0.045em] leading-[0.9]",
} as const

export function EditorsHeadline({
  children,
  accentWord,
  signal,
  size = "lg",
  className,
  as = "h1",
}: EditorsHeadlineProps) {
  const Tag = as
  let rendered: React.ReactNode = children
  if (typeof children === "string" && accentWord) {
    const idx = children.toLowerCase().indexOf(accentWord.toLowerCase())
    if (idx >= 0) {
      const before = children.slice(0, idx)
      const word = children.slice(idx, idx + accentWord.length)
      const after = children.slice(idx + accentWord.length)
      rendered = (
        <>
          {before}
          <span className={cn("accent-word", signal && "signal")}>{word}</span>
          {after}
        </>
      )
    }
  }
  return (
    <Tag className={cn("font-display font-bold", sizeMap[size], className)}>
      {rendered}
    </Tag>
  )
}
