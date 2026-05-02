import { cn } from "@/lib/utils"

export function InkWash({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        background:
          "radial-gradient(ellipse 50% 35% at 25% 25%, hsl(var(--accent) / 0.18), transparent 60%)," +
          "radial-gradient(ellipse 45% 40% at 80% 75%, hsl(var(--signal) / 0.14), transparent 60%)",
      }}
    />
  )
}
