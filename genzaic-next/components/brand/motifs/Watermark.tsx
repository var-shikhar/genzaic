import { cn } from "@/lib/utils"

export function Watermark({
  value,
  position = "br",
  size = 180,
  className,
}: {
  value: string
  position?: "br" | "bl" | "tr" | "tl"
  size?: number
  className?: string
}) {
  const posMap = {
    br: "right-[-12px] bottom-[-50px]",
    bl: "left-[-12px] bottom-[-50px]",
    tr: "right-[-12px] top-[-50px]",
    tl: "left-[-12px] top-[-50px]",
  }
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute font-display font-bold tracking-[-0.05em] leading-[0.85] text-foreground/[0.06]",
        posMap[position],
        className,
      )}
      style={{ fontSize: size }}
    >
      {value}
    </div>
  )
}
