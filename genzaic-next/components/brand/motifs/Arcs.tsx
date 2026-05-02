import { cn } from "@/lib/utils"

export function Arcs({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute right-[-140px] bottom-[-140px] w-[280px] h-[280px] rounded-full border border-paper/20" />
      <div className="absolute right-[-100px] bottom-[-100px] w-[200px] h-[200px] rounded-full border border-flicker/50" />
      <div className="absolute right-[-60px]  bottom-[-60px]  w-[120px] h-[120px] rounded-full border border-paper/25" />
    </div>
  )
}
