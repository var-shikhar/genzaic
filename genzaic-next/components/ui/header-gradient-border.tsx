import { cn } from "@/lib/utils"

/**
 * A gradient line for the bottom of a sticky header: bright in the center
 * and fading out toward both corners, with a soft glow for visibility.
 * Anchor it inside a positioned (sticky/fixed/relative) parent — it
 * absolutely fills the bottom edge.
 */
export function HeaderGradientBorder({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0",
        className,
      )}
    >
      {/* soft glow */}
      <span
        className="absolute inset-x-0 bottom-0 h-[4px] blur-[2px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.5) 28%, hsl(var(--primary) / 0.85) 50%, hsl(var(--primary) / 0.5) 72%, transparent 100%)",
        }}
      />
      {/* crisp line */}
      <span
        className="absolute inset-x-0 bottom-0 h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.6) 22%, hsl(var(--primary)) 50%, hsl(var(--primary) / 0.6) 78%, transparent 100%)",
        }}
      />
    </span>
  )
}
