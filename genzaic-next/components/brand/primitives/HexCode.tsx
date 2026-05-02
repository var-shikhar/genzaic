import { cn } from "@/lib/utils"

export function HexCode({
  code,
  prefix,
  className,
  accent = true,
}: {
  code: string
  /** Optional imprint slug prefix, e.g. "shikhar/". */
  prefix?: string
  className?: string
  accent?: boolean
}) {
  return (
    <span
      className={cn(
        "font-mono text-xs tracking-[0.05em]",
        accent ? "text-primary" : "text-muted-foreground",
        className,
      )}
    >
      {prefix && <span className="opacity-60">{prefix}</span>}#{code}
    </span>
  )
}
